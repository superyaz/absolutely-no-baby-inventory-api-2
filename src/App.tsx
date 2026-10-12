/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  inventoryStore
} from './services/inventoryStore';
import {
  Store,
  Product,
  StoreInventoryItem,
  MovementRecord,
  TransferRequest,
  PhysicalCountAudit,
  User,
  SeasonCollection,
  MovementType,
  ProductVariant
} from './types/inventory';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { MovementsView } from './components/MovementsView';
import { TransfersView } from './components/TransfersView';
import { PhysicalCountView } from './components/PhysicalCountView';
import { LowStockAlertsView } from './components/LowStockAlertsView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { LabelPrintModal } from './components/LabelPrintModal';
import { ProductFormModal } from './components/ProductFormModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { BrandLogo } from './components/BrandLogo';

export default function App() {
  // State synchronized with distributed store
  const [stores, setStores] = useState<Store[]>(() => inventoryStore.getStores());
  const [currentStore, setCurrentStore] = useState<Store>(() => inventoryStore.getCurrentStore());
  const [users, setUsers] = useState<User[]>(() => inventoryStore.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => inventoryStore.getCurrentUser());
  const [products, setProducts] = useState<Product[]>(() => inventoryStore.getProducts());
  const [inventory, setInventory] = useState<StoreInventoryItem[]>(() => inventoryStore.getInventory());
  const [movements, setMovements] = useState<MovementRecord[]>(() => inventoryStore.getMovements());
  const [transfers, setTransfers] = useState<TransferRequest[]>(() => inventoryStore.getTransfers());
  const [audits, setAudits] = useState<PhysicalCountAudit[]>(() => inventoryStore.getAudits());
  const [seasons, setSeasons] = useState<SeasonCollection[]>(() => inventoryStore.getSeasons());

  // Navigation View
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLabelPrinterOpen, setIsLabelPrinterOpen] = useState(false);
  const [labelPrinterTarget, setLabelPrinterTarget] = useState<{
    product: Product | null;
    variant: ProductVariant | null;
  }>({ product: null, variant: null });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Sync with distributed store changes (across tabs and storage updates)
  useEffect(() => {
    const refreshData = () => {
      setStores(inventoryStore.getStores());
      setCurrentStore(inventoryStore.getCurrentStore());
      setUsers(inventoryStore.getUsers());
      setCurrentUser(inventoryStore.getCurrentUser());
      setProducts(inventoryStore.getProducts());
      setInventory(inventoryStore.getInventory());
      setMovements(inventoryStore.getMovements());
      setTransfers(inventoryStore.getTransfers());
      setAudits(inventoryStore.getAudits());
      setSeasons(inventoryStore.getSeasons());
    };

    const unsubscribe = inventoryStore.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  // Handlers for Store & User switching
  const handleSelectStore = (store: Store) => {
    inventoryStore.setCurrentStore(store);
    setCurrentStore(store);
  };

  const handleSelectUser = (user: User) => {
    inventoryStore.setCurrentUser(user);
    setCurrentUser(user);
    // If user has specific assigned store, switch context
    if (user.storeId) {
      const st = stores.find((s) => s.id === user.storeId);
      if (st) {
        inventoryStore.setCurrentStore(st);
        setCurrentStore(st);
      }
    }
  };

  // Handlers for Stock Movements
  const handleExecuteMovement = (params: {
    type: MovementType;
    storeId: string;
    sku: string;
    quantity: number;
    user: User;
    reason: string;
    referenceDoc?: string;
    notes?: string;
  }) => {
    return inventoryStore.executeStockMovement(params);
  };

  // Handlers for Transfers
  const handleCreateTransfer = (params: {
    fromStoreId: string;
    toStoreId: string;
    items: Array<{ sku: string; quantity: number }>;
    user: User;
    notes?: string;
  }) => {
    return inventoryStore.createTransferRequest(params);
  };

  const handleApproveTransfer = (transferId: string, user: User) => {
    return inventoryStore.approveAndDispatchTransfer(transferId, user);
  };

  const handleReceiveTransfer = (transferId: string, user: User) => {
    return inventoryStore.receiveTransfer(transferId, user);
  };

  const handleRejectTransfer = (transferId: string, user: User, reason: string) => {
    return inventoryStore.rejectTransfer(transferId, user, reason);
  };

  // Handlers for Products
  const handleSaveProduct = (product: Product) => {
    return inventoryStore.saveProduct(product);
  };

  const handleToggleProductActive = (productId: string) => {
    inventoryStore.toggleProductStatus(productId);
  };

  // Handlers for Physical Audits
  const handleSaveAudit = (audit: PhysicalCountAudit) => {
    inventoryStore.saveAudit(audit);
  };

  const handleApplyAdjustment = (auditId: string, user: User, reason: string) => {
    return inventoryStore.applyAuditAdjustment(auditId, user, reason);
  };

  // Label printer opening helper
  const handleOpenLabelPrinter = (product?: Product, variant?: ProductVariant) => {
    setLabelPrinterTarget({
      product: product || null,
      variant: variant || null
    });
    setIsLabelPrinterOpen(true);
  };

  // Quick transfer request from inventory matrix or alerts
  const handleRequestTransferForSku = (sku: string, fromStoreId?: string) => {
    setActiveView('transfers');
    // Can auto trigger modal or let user inspect in Transfers view
  };

  // Pending counts for badges
  const pendingTransfersCount = transfers.filter(
    (t) => t.status === 'SOLICITADA' || t.status === 'EN_TRANSITO'
  ).length;

  const lowStockAlertsCount = inventory.filter(
    (i) => i.storeId === currentStore.id && i.quantity <= i.minStockAlert && i.quantity >= 0
  ).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top App Header & Navigation */}
      <Navbar
        currentStore={currentStore}
        allStores={stores}
        onSelectStore={handleSelectStore}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenLabelPrinter={() => handleOpenLabelPrinter()}
        onOpenNewProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onOpenArchitectureDocs={() => setIsArchitectureModalOpen(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        pendingTransfersCount={pendingTransfersCount}
        lowStockAlertsCount={lowStockAlertsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'dashboard' && (
          <DashboardView
            currentStore={currentStore}
            allStores={stores}
            products={products}
            inventory={inventory}
            movements={movements}
            transfers={transfers}
            seasons={seasons}
            currentUser={currentUser}
            onNavigate={setActiveView}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenLabelPrinter={() => handleOpenLabelPrinter()}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
          />
        )}

        {activeView === 'inventory' && (
          <InventoryView
            currentStore={currentStore}
            allStores={stores}
            products={products}
            inventory={inventory}
            seasons={seasons}
            currentUser={currentUser}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
            onToggleProductActive={handleToggleProductActive}
            onOpenLabelPrinter={handleOpenLabelPrinter}
            onQuickMovement={(type, sku, qty, reason) => {
              handleExecuteMovement({
                type,
                storeId: currentStore.id,
                sku,
                quantity: qty,
                user: currentUser,
                reason
              });
            }}
            onRequestTransferForSku={handleRequestTransferForSku}
          />
        )}

        {activeView === 'movements' && (
          <MovementsView
            currentStore={currentStore}
            allStores={stores}
            products={products}
            inventory={inventory}
            movements={movements}
            currentUser={currentUser}
            onExecuteMovement={handleExecuteMovement}
          />
        )}

        {activeView === 'transfers' && (
          <TransfersView
            currentStore={currentStore}
            allStores={stores}
            products={products}
            inventory={inventory}
            transfers={transfers}
            currentUser={currentUser}
            onCreateTransfer={handleCreateTransfer}
            onApproveTransfer={handleApproveTransfer}
            onReceiveTransfer={handleReceiveTransfer}
            onRejectTransfer={handleRejectTransfer}
          />
        )}

        {activeView === 'counts' && (
          <PhysicalCountView
            currentStore={currentStore}
            allStores={stores}
            products={products}
            inventory={inventory}
            audits={audits}
            currentUser={currentUser}
            onSaveAudit={handleSaveAudit}
            onApplyAdjustment={handleApplyAdjustment}
          />
        )}

        {activeView === 'alerts' && (
          <LowStockAlertsView
            currentStore={currentStore}
            allStores={stores}
            products={products}
            inventory={inventory}
            currentUser={currentUser}
            onRequestTransferForSku={handleRequestTransferForSku}
            onQuickInbound={(sku) => {
              handleExecuteMovement({
                type: 'ENTRADA',
                storeId: currentStore.id,
                sku,
                quantity: 10,
                user: currentUser,
                reason: 'Reposición urgente por alerta de stock bajo'
              });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-6 px-4 text-xs text-neutral-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={true} />
            <span className="hidden sm:inline">|</span>
            <span>Sistema Centralizado de Inventario Multi-Tienda</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Valle de Aburrá (Medellín · Bello · Sabaneta · Envigado · Itagüí)</span>
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-4"
            >
              Arquitectura & CI/CD
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Barcode Scanner Modal (Camera + USB laser gun) */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        inventory={inventory}
        currentStore={currentStore}
        onSelectProduct={(prod, sku) => {
          setActiveView('inventory');
        }}
        onQuickInbound={(prod, sku, qty) => {
          handleExecuteMovement({
            type: 'ENTRADA',
            storeId: currentStore.id,
            sku,
            quantity: qty,
            user: currentUser,
            reason: 'Entrada registrada mediante escáner óptico de código de barras'
          });
        }}
        onQuickOutbound={(prod, sku, qty) => {
          handleExecuteMovement({
            type: 'SALIDA_VENTA',
            storeId: currentStore.id,
            sku,
            quantity: qty,
            user: currentUser,
            reason: 'Venta registrada mediante escáner óptico de código de barras'
          });
        }}
      />

      {/* 2. Barcode Label Generator & Printer Modal */}
      <LabelPrintModal
        isOpen={isLabelPrinterOpen}
        onClose={() => setIsLabelPrinterOpen(false)}
        products={products}
        currentStore={currentStore}
        initialProduct={labelPrinterTarget.product}
        initialVariant={labelPrinterTarget.variant}
      />

      {/* 3. Product Reference 7-Digit Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        existingProducts={products}
        seasons={seasons}
      />

      {/* 4. Architecture, CI/CD & Cloud Security Modal */}
      <ArchitectureDocsModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
