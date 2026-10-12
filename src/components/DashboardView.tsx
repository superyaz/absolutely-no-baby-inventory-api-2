import React from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  DollarSign,
  Store as StoreIcon,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Layers,
  Camera,
  Printer
} from 'lucide-react';
import {
  Product,
  Store,
  StoreInventoryItem,
  MovementRecord,
  TransferRequest,
  SeasonCollection,
  User
} from '../types/inventory';
import { formatCOP, formatCode7Display } from '../utils/code7';

interface DashboardViewProps {
  currentStore: Store;
  allStores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  movements: MovementRecord[];
  transfers: TransferRequest[];
  seasons: SeasonCollection[];
  currentUser: User;
  onNavigate: (view: string) => void;
  onOpenScanner: () => void;
  onOpenLabelPrinter: () => void;
  onOpenNewProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentStore,
  allStores,
  products,
  inventory,
  movements,
  transfers,
  seasons,
  currentUser,
  onNavigate,
  onOpenScanner,
  onOpenLabelPrinter,
  onOpenNewProduct
}) => {
  // Current store calculations
  const currentStoreInventory = inventory.filter((i) => i.storeId === currentStore.id);
  const currentStoreUnits = currentStoreInventory.reduce((acc, curr) => acc + curr.quantity, 0);

  // Global calculations across all stores (Valle de Aburrá)
  const totalNetworkUnits = inventory.reduce((acc, curr) => acc + curr.quantity, 0);

  // Total valuation ($ COP)
  const totalNetworkValuation = inventory.reduce((acc, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);

  // Low stock alerts
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStockAlert && i.quantity >= 0);
  const currentStoreLowStock = currentStoreInventory.filter(
    (i) => i.quantity <= i.minStockAlert && i.quantity >= 0
  );

  // Pending transfers
  const pendingTransfers = transfers.filter((t) => t.status === 'SOLICITADA' || t.status === 'EN_TRANSITO');

  // Most stocked & least stocked products in current store
  const productStockMap = new Map<string, { product: Product; totalQty: number }>();
  currentStoreInventory.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return;
    const current = productStockMap.get(prod.id) || { product: prod, totalQty: 0 };
    current.totalQty += item.quantity;
    productStockMap.set(prod.id, current);
  });

  const sortedStockArray = Array.from(productStockMap.values()).sort((a, b) => b.totalQty - a.totalQty);
  const topStocked = sortedStockArray.slice(0, 4);
  const leastStocked = sortedStockArray.slice(-4).reverse();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950/40 border border-neutral-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              Valle de Aburrá · Red Multi-Tienda
            </span>
            <span className="text-[11px] font-medium text-neutral-400">
              Punto Activo: <strong className="text-white">{currentStore.name}</strong> ({currentStore.municipality})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
            Gestión de Inventario en Tiempo Real
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
            Monitoreo en vivo de existencias por tienda, talla y color. Sistema de codificación estandarizado de 7 dígitos, trazabilidad inmutable y transferencias sincronizadas.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/25 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Lector Barcode / Cámara
            </button>
            <button
              onClick={onOpenLabelPrinter}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 rounded-xl text-xs font-bold transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Generar & Imprimir Etiquetas
            </button>
            <button
              onClick={() => onNavigate('transfers')}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 rounded-xl text-xs font-bold transition active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Solicitar Traslado
            </button>
            {currentUser.role === 'admin_general' && (
              <button
                onClick={onOpenNewProduct}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 rounded-xl text-xs font-bold transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Nueva Prenda (7D)
              </button>
            )}
          </div>
        </div>

        {/* Decorative background logo */}
        <div className="absolute right-0 bottom-0 top-0 w-80 opacity-5 pointer-events-none flex items-center justify-center">
          <div className="w-96 h-96 rounded-full border-[32px] border-white" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Units in Current Store */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Stock {currentStore.shortCode}
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
              <StoreIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {currentStoreUnits}
              <span className="text-xs font-normal text-neutral-500 ml-1.5 font-sans">unids.</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 truncate">
              {currentStore.name} ({currentStore.municipality})
            </p>
          </div>
        </div>

        {/* KPI 2: Total Network Units & Valuation */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Red Total Aburrá
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalNetworkUnits}
              <span className="text-xs font-normal text-neutral-500 ml-1.5 font-sans">unids.</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">
              Valuación: {formatCOP(totalNetworkValuation)}
            </p>
          </div>
        </div>

        {/* KPI 3: Low Stock Alerts */}
        <div
          onClick={() => onNavigate('alerts')}
          className="bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 cursor-pointer rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Alertas Stock Bajo
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                currentStoreLowStock.length > 0
                  ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {currentStoreLowStock.length}
              <span className="text-xs font-normal text-neutral-500 ml-1.5 font-sans">
                en esta tienda ({lowStockItems.length} red)
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1 group-hover:text-amber-300 transition">
              <span>Ver detalles de reposición</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* KPI 4: Pending Transfers */}
        <div
          onClick={() => onNavigate('transfers')}
          className="bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 cursor-pointer rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Transferencias
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {pendingTransfers.length}
              <span className="text-xs font-normal text-neutral-500 ml-1.5 font-sans">activas</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1 group-hover:text-blue-300 transition">
              <span>Gestionar solicitudes</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Stores Comparison & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stores in Valle de Aburrá */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Breakdown */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <StoreIcon className="w-4 h-4 text-red-500" />
                  Existencias por Punto de Venta (Valle de Aburrá)
                </h3>
                <p className="text-xs text-neutral-400">
                  Inventarios independientes y trazabilidad entre sucursales
                </p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                Ver Matriz Completa <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allStores.map((store) => {
                const storeInv = inventory.filter((i) => i.storeId === store.id);
                const units = storeInv.reduce((acc, curr) => acc + curr.quantity, 0);
                const percent = totalNetworkUnits > 0 ? Math.round((units / totalNetworkUnits) * 100) : 0;
                const isSelected = store.id === currentStore.id;

                return (
                  <div
                    key={store.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-neutral-950 border-red-500 shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="truncate">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          {store.shortCode} {store.isWarehouse ? '· CEDI' : ''}
                        </span>
                        <div className="font-bold text-xs text-white truncate">{store.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{store.municipality}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black font-mono text-white">{units}</div>
                        <span className="text-[10px] text-neutral-500 font-mono">{percent}% red</span>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isSelected ? 'bg-red-500' : 'bg-neutral-600'}`}
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top & Critical Stock in Current Store */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Stocked */}
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Mayor Disponibilidad ({currentStore.shortCode})</span>
                <span className="text-[10px] text-neutral-500">Unidades</span>
              </h4>
              <div className="space-y-2">
                {topStocked.map(({ product, totalQty }) => (
                  <div
                    key={product.id}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="text-[10px] font-mono text-red-400 font-bold block">
                        {formatCode7Display(product.code7)}
                      </span>
                      <div className="font-semibold text-white truncate">{product.name}</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{totalQty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Least Stocked / Critical */}
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Menor Existencia ({currentStore.shortCode})</span>
                <span className="text-[10px] text-neutral-500">Stock</span>
              </h4>
              <div className="space-y-2">
                {leastStocked.map(({ product, totalQty }) => (
                  <div
                    key={product.id}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold block">
                        {formatCode7Display(product.code7)}
                      </span>
                      <div className="font-semibold text-white truncate">{product.name}</div>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm ${
                        totalQty <= product.minStockAlert ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      {totalQty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Movements & Seasonal Collections */}
        <div className="space-y-6">
          {/* Recent movements */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  Movimientos Recientes
                </h3>
                <p className="text-xs text-neutral-400">Auditoría inmutable de transacciones</p>
              </div>
              <button
                onClick={() => onNavigate('movements')}
                className="text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-2.5">
              {movements.slice(0, 5).map((mov) => {
                const isPositive = mov.delta > 0;
                return (
                  <div
                    key={mov.id}
                    className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-neutral-500">{mov.code}</span>
                      <span
                        className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          isPositive
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950/60 text-red-400 border border-red-800'
                        }`}
                      >
                        {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`} unids
                      </span>
                    </div>

                    <div className="font-semibold text-white truncate">{mov.productName}</div>

                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>
                        {mov.storeName} · {mov.size}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seasonal Collections card */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-400" />
              Colecciones & Temporadas
            </h3>
            <div className="space-y-2">
              {seasons.map((season) => {
                const seasonProds = products.filter((p) => p.seasonId === season.id);
                return (
                  <div
                    key={season.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{season.name}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          season.active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {season.active ? 'Activa' : 'Histórica'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug">{season.description}</p>
                    <div className="text-[10px] font-mono text-neutral-500 pt-1">
                      {seasonProds.length} referencias registradas · Año {season.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
