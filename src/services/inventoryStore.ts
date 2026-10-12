import {
  Product,
  Store,
  StoreInventoryItem,
  MovementRecord,
  TransferRequest,
  PhysicalCountAudit,
  User,
  SeasonCollection,
  MovementType,
  Size,
  ColorOption
} from '../types/inventory';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_MOVEMENTS,
  INITIAL_TRANSFERS,
  INITIAL_AUDITS,
  INITIAL_USERS,
  INITIAL_SEASONS
} from './mockData';

const STORAGE_KEYS = {
  STORES: 'anb_stores_v1',
  PRODUCTS: 'anb_products_v1',
  INVENTORY: 'anb_inventory_v1',
  MOVEMENTS: 'anb_movements_v1',
  TRANSFERS: 'anb_transfers_v1',
  AUDITS: 'anb_audits_v1',
  USERS: 'anb_users_v1',
  SEASONS: 'anb_seasons_v1',
  CURRENT_USER: 'anb_current_user_v1',
  CURRENT_STORE: 'anb_current_store_v1'
};

class DistributedInventoryStore {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('anb_inventory_sync');
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_REFRESH') {
          this.notifyListeners();
        }
      };
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  private broadcastChange(): void {
    this.notifyListeners();
    if (this.channel) {
      this.channel.postMessage({ type: 'SYNC_REFRESH', timestamp: Date.now() });
    }
  }

  // Generic Local Storage Helpers
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // --- STORES ---
  public getStores(): Store[] {
    return this.getItem<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
  }

  public getStore(storeId: string): Store | undefined {
    return this.getStores().find((s) => s.id === storeId);
  }

  public saveStore(store: Store): void {
    const stores = this.getStores();
    const idx = stores.findIndex((s) => s.id === store.id);
    if (idx >= 0) {
      stores[idx] = store;
    } else {
      stores.push(store);
    }
    this.setItem(STORAGE_KEYS.STORES, stores);
    this.broadcastChange();
  }

  // --- CURRENT USER & AUTH ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const saved = this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved && users.some((u) => u.id === saved.id)) {
      return saved;
    }
    return users[0]; // Default to Valentina Restrepo (Admin General)
  }

  public setCurrentUser(user: User): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.broadcastChange();
  }

  // --- CURRENT STORE CONTEXT ---
  public getCurrentStore(): Store {
    const stores = this.getStores();
    const currentUser = this.getCurrentUser();

    // If user is locked to a specific store
    if (currentUser.role !== 'admin_general' && currentUser.storeId) {
      const assigned = stores.find((s) => s.id === currentUser.storeId);
      if (assigned) return assigned;
    }

    const saved = this.getItem<Store | null>(STORAGE_KEYS.CURRENT_STORE, null);
    if (saved && stores.some((s) => s.id === saved.id)) {
      return saved;
    }
    return stores[0]; // Default to El Tesoro
  }

  public setCurrentStore(store: Store): void {
    this.setItem(STORAGE_KEYS.CURRENT_STORE, store);
    this.broadcastChange();
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public getProduct(productId: string): Product | undefined {
    return this.getProducts().find((p) => p.id === productId);
  }

  public getProductByCode7(code7: string): Product | undefined {
    return this.getProducts().find((p) => p.code7 === code7.trim());
  }

  public saveProduct(product: Product): { success: boolean; error?: string } {
    const products = this.getProducts();
    const existing = products.find((p) => p.code7 === product.code7 && p.id !== product.id);
    if (existing) {
      return {
        success: false,
        error: `El código de 7 dígitos ${product.code7} ya está asignado a "${existing.name}". Cada prenda debe tener un código único según los requerimientos.`
      };
    }

    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      products[idx] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      products.unshift({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      // Initialize inventory records across stores for variants
      this.ensureInventoryForProduct(product);
    }

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.broadcastChange();
    return { success: true };
  }

  public toggleProductStatus(productId: string): void {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      prod.active = !prod.active;
      prod.updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      this.broadcastChange();
    }
  }

  // --- SEASONS / COLLECTIONS ---
  public getSeasons(): SeasonCollection[] {
    return this.getItem<SeasonCollection[]>(STORAGE_KEYS.SEASONS, INITIAL_SEASONS);
  }

  public saveSeason(season: SeasonCollection): void {
    const seasons = this.getSeasons();
    const idx = seasons.findIndex((s) => s.id === season.id);
    if (idx >= 0) {
      seasons[idx] = season;
    } else {
      seasons.push(season);
    }
    this.setItem(STORAGE_KEYS.SEASONS, seasons);
    this.broadcastChange();
  }

  // --- INVENTORY ---
  public getInventory(): StoreInventoryItem[] {
    return this.getItem<StoreInventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  }

  public getStock(storeId: string, sku: string): number {
    const inv = this.getInventory();
    const item = inv.find((i) => i.storeId === storeId && i.sku === sku);
    return item ? item.quantity : 0;
  }

  private ensureInventoryForProduct(product: Product): void {
    const stores = this.getStores();
    const inventory = this.getInventory();
    let changed = false;

    stores.forEach((store) => {
      product.variants.forEach((variant) => {
        const exists = inventory.some((i) => i.storeId === store.id && i.sku === variant.sku);
        if (!exists) {
          inventory.push({
            storeId: store.id,
            sku: variant.sku,
            productId: product.id,
            productName: product.name,
            code7: product.code7,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            quantity: 0,
            minStockAlert: product.minStockAlert,
            updatedAt: new Date().toISOString()
          });
          changed = true;
        }
      });
    });

    if (changed) {
      this.setItem(STORAGE_KEYS.INVENTORY, inventory);
    }
  }

  // --- MOVEMENTS & AUDIT LOG ---
  public getMovements(): MovementRecord[] {
    return this.getItem<MovementRecord[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  }

  /**
   * Core atomic stock update with audit trail
   */
  public executeStockMovement(params: {
    type: MovementType;
    storeId: string;
    sku: string;
    quantity: number; // positive amount
    user: User;
    reason: string;
    targetStoreId?: string;
    referenceDoc?: string;
    notes?: string;
  }): { success: boolean; error?: string; record?: MovementRecord } {
    const { type, storeId, sku, quantity, user, reason, targetStoreId, referenceDoc, notes } = params;

    if (quantity <= 0) {
      return { success: false, error: 'La cantidad debe ser mayor a 0.' };
    }

    const inventory = this.getInventory();
    const stores = this.getStores();
    const products = this.getProducts();

    const store = stores.find((s) => s.id === storeId);
    if (!store) return { success: false, error: 'Tienda no encontrada.' };

    const targetStore = targetStoreId ? stores.find((s) => s.id === targetStoreId) : undefined;

    let item = inventory.find((i) => i.storeId === storeId && i.sku === sku);

    // If item record doesn't exist yet in this store, initialize it
    if (!item) {
      // find product info
      const prod = products.find((p) => p.variants.some((v) => v.sku === sku));
      const variant = prod?.variants.find((v) => v.sku === sku);
      if (!prod || !variant) {
        return { success: false, error: `SKU ${sku} no existe en el catálogo.` };
      }

      item = {
        storeId,
        sku,
        productId: prod.id,
        productName: prod.name,
        code7: prod.code7,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        quantity: 0,
        minStockAlert: prod.minStockAlert,
        updatedAt: new Date().toISOString()
      };
      inventory.push(item);
    }

    const previousStock = item.quantity;
    let delta = 0;

    switch (type) {
      case 'ENTRADA':
      case 'TRANSFERENCIA_ENTRADA':
      case 'AJUSTE_CONTEO_POSITIVO':
      case 'DEVOLUCION_CLIENTE':
        delta = quantity;
        break;

      case 'SALIDA_VENTA':
      case 'SALIDA_PERDIDA':
      case 'SALIDA_DEFECTO':
      case 'SALIDA_DONACION':
      case 'SALIDA_OTRO':
      case 'TRANSFERENCIA_SALIDA':
      case 'AJUSTE_CONTEO_NEGATIVO':
      case 'DEVOLUCION_PROVEEDOR':
        delta = -quantity;
        if (previousStock < quantity) {
          return {
            success: false,
            error: `Stock insuficiente en ${store.name}. Disponible: ${previousStock} unids. Solicitado: ${quantity} unids.`
          };
        }
        break;
    }

    const newStock = previousStock + delta;
    item.quantity = newStock;
    item.updatedAt = new Date().toISOString();

    const record: MovementRecord = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: `MOV-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      type,
      storeId,
      storeName: store.name,
      targetStoreId,
      targetStoreName: targetStore?.name,
      sku: item.sku,
      code7: item.code7,
      productName: item.productName,
      size: item.size,
      color: item.color,
      quantity,
      previousStock,
      newStock,
      delta,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      referenceDoc,
      reason,
      notes
    };

    const movements = this.getMovements();
    movements.unshift(record);

    this.setItem(STORAGE_KEYS.INVENTORY, inventory);
    this.setItem(STORAGE_KEYS.MOVEMENTS, movements);
    this.broadcastChange();

    return { success: true, record };
  }

  // --- TRANSFERS BETWEEN STORES ---
  public getTransfers(): TransferRequest[] {
    return this.getItem<TransferRequest[]>(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS);
  }

  public createTransferRequest(params: {
    fromStoreId: string;
    toStoreId: string;
    items: Array<{ sku: string; quantity: number }>;
    user: User;
    notes?: string;
  }): { success: boolean; error?: string; transfer?: TransferRequest } {
    const stores = this.getStores();
    const fromStore = stores.find((s) => s.id === params.fromStoreId);
    const toStore = stores.find((s) => s.id === params.toStoreId);

    if (!fromStore || !toStore) {
      return { success: false, error: 'Tienda origen o destino inválida.' };
    }

    if (params.fromStoreId === params.toStoreId) {
      return { success: false, error: 'La tienda origen y destino no pueden ser la misma.' };
    }

    const products = this.getProducts();
    const inventory = this.getInventory();

    const transferItems: TransferRequest['items'] = [];

    for (const reqItem of params.items) {
      if (reqItem.quantity <= 0) continue;

      const currentFromStock =
        inventory.find((i) => i.storeId === params.fromStoreId && i.sku === reqItem.sku)?.quantity || 0;

      // Validate availability unless overridden
      if (currentFromStock < reqItem.quantity) {
        return {
          success: false,
          error: `Stock insuficiente en ${fromStore.name} para SKU ${reqItem.sku}. Disponible: ${currentFromStock} unids. Requerido: ${reqItem.quantity} unids.`
        };
      }

      const prod = products.find((p) => p.variants.some((v) => v.sku === reqItem.sku));
      const variant = prod?.variants.find((v) => v.sku === reqItem.sku);

      if (prod && variant) {
        transferItems.push({
          sku: reqItem.sku,
          productId: prod.id,
          productName: prod.name,
          code7: prod.code7,
          size: variant.size,
          color: variant.color,
          quantity: reqItem.quantity
        });
      }
    }

    if (transferItems.length === 0) {
      return { success: false, error: 'Debe incluir al menos un producto con cantidad válida.' };
    }

    const transfer: TransferRequest = {
      id: `trf-${Date.now()}`,
      code: `TRF-${fromStore.shortCode}-${toStore.shortCode}-${Math.floor(100 + Math.random() * 900)}`,
      fromStoreId: fromStore.id,
      fromStoreName: fromStore.name,
      toStoreId: toStore.id,
      toStoreName: toStore.name,
      items: transferItems,
      status: 'SOLICITADA',
      requestedAt: new Date().toISOString(),
      requestedBy: {
        id: params.user.id,
        name: params.user.name,
        email: params.user.email
      },
      notes: params.notes
    };

    const transfers = this.getTransfers();
    transfers.unshift(transfer);
    this.setItem(STORAGE_KEYS.TRANSFERS, transfers);
    this.broadcastChange();

    return { success: true, transfer };
  }

  public approveAndDispatchTransfer(transferId: string, user: User): { success: boolean; error?: string } {
    const transfers = this.getTransfers();
    const transfer = transfers.find((t) => t.id === transferId);

    if (!transfer) return { success: false, error: 'Transferencia no encontrada.' };
    if (transfer.status !== 'SOLICITADA') {
      return { success: false, error: `La transferencia se encuentra en estado ${transfer.status}.` };
    }

    // Deduct items from source store
    for (const item of transfer.items) {
      const res = this.executeStockMovement({
        type: 'TRANSFERENCIA_SALIDA',
        storeId: transfer.fromStoreId,
        targetStoreId: transfer.toStoreId,
        sku: item.sku,
        quantity: item.quantity,
        user,
        referenceDoc: transfer.code,
        reason: `Despacho aprobado para traslado a ${transfer.toStoreName}`,
        notes: transfer.notes
      });

      if (!res.success) {
        return { success: false, error: `Error al despachar ${item.productName}: ${res.error}` };
      }
    }

    transfer.status = 'EN_TRANSITO';
    transfer.respondedAt = new Date().toISOString();
    transfer.respondedBy = { id: user.id, name: user.name };

    this.setItem(STORAGE_KEYS.TRANSFERS, transfers);
    this.broadcastChange();
    return { success: true };
  }

  public receiveTransfer(transferId: string, user: User): { success: boolean; error?: string } {
    const transfers = this.getTransfers();
    const transfer = transfers.find((t) => t.id === transferId);

    if (!transfer) return { success: false, error: 'Transferencia no encontrada.' };
    if (transfer.status !== 'EN_TRANSITO' && transfer.status !== 'APROBADA') {
      return { success: false, error: 'La transferencia no está lista para recepción.' };
    }

    // Add items to destination store
    for (const item of transfer.items) {
      const res = this.executeStockMovement({
        type: 'TRANSFERENCIA_ENTRADA',
        storeId: transfer.toStoreId,
        targetStoreId: transfer.fromStoreId,
        sku: item.sku,
        quantity: item.quantity,
        user,
        referenceDoc: transfer.code,
        reason: `Recepción conforme de traslado desde ${transfer.fromStoreName}`,
        notes: transfer.notes
      });

      if (!res.success) {
        return { success: false, error: `Error al recibir ${item.productName}: ${res.error}` };
      }
    }

    transfer.status = 'RECIBIDA';
    transfer.receivedAt = new Date().toISOString();
    transfer.receivedBy = { id: user.id, name: user.name };

    this.setItem(STORAGE_KEYS.TRANSFERS, transfers);
    this.broadcastChange();
    return { success: true };
  }

  public rejectTransfer(transferId: string, user: User, rejectionReason: string): { success: boolean; error?: string } {
    const transfers = this.getTransfers();
    const transfer = transfers.find((t) => t.id === transferId);

    if (!transfer) return { success: false, error: 'Transferencia no encontrada.' };
    if (transfer.status !== 'SOLICITADA') {
      return { success: false, error: 'Solo solicitudes pendientes pueden ser rechazadas.' };
    }

    transfer.status = 'RECHAZADA';
    transfer.respondedAt = new Date().toISOString();
    transfer.respondedBy = { id: user.id, name: user.name };
    transfer.rejectionReason = rejectionReason || 'Rechazada por falta de stock o prioridad de venta en tienda origen.';

    this.setItem(STORAGE_KEYS.TRANSFERS, transfers);
    this.broadcastChange();
    return { success: true };
  }

  // --- PHYSICAL COUNT AUDITS ---
  public getAudits(): PhysicalCountAudit[] {
    return this.getItem<PhysicalCountAudit[]>(STORAGE_KEYS.AUDITS, INITIAL_AUDITS);
  }

  public saveAudit(audit: PhysicalCountAudit): void {
    const audits = this.getAudits();
    const idx = audits.findIndex((a) => a.id === audit.id);
    if (idx >= 0) {
      audits[idx] = audit;
    } else {
      audits.unshift(audit);
    }
    this.setItem(STORAGE_KEYS.AUDITS, audits);
    this.broadcastChange();
  }

  public applyAuditAdjustment(auditId: string, user: User, adjustmentReason: string): { success: boolean; error?: string } {
    const audits = this.getAudits();
    const audit = audits.find((a) => a.id === auditId);

    if (!audit) return { success: false, error: 'Auditoría no encontrada.' };
    if (audit.adjustmentApplied) {
      return { success: false, error: 'El ajuste para esta auditoría ya fue aplicado anteriormente.' };
    }

    // Apply adjustments for each line with variance != 0
    for (const item of audit.items) {
      if (item.variance === 0) continue;

      const isPositive = item.variance > 0;
      const type: MovementType = isPositive ? 'AJUSTE_CONTEO_POSITIVO' : 'AJUSTE_CONTEO_NEGATIVO';

      this.executeStockMovement({
        type,
        storeId: audit.storeId,
        sku: item.sku,
        quantity: Math.abs(item.variance),
        user,
        referenceDoc: audit.code,
        reason: `Ajuste por conteo físico: ${adjustmentReason}`,
        notes: item.notes || `Discrepancia detectada: Sistema ${item.systemQty}, Físico ${item.countedQty}`
      });
    }

    audit.adjustmentApplied = true;
    audit.adjustmentReason = adjustmentReason;
    audit.supervisorName = user.name;
    audit.completedAt = new Date().toISOString();
    audit.status = 'COMPLETADO';

    this.setItem(STORAGE_KEYS.AUDITS, audits);
    this.broadcastChange();
    return { success: true };
  }

  // --- RESET TO OFFICIAL DEMO DATA ---
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.STORES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
    localStorage.removeItem(STORAGE_KEYS.AUDITS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SEASONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STORE);
    this.broadcastChange();
  }
}

export const inventoryStore = new DistributedInventoryStore();
