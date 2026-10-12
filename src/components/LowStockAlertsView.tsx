import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  ArrowDownLeft,
  Store as StoreIcon,
  CheckCircle2,
  PackageX,
  Sliders,
  Building2
} from 'lucide-react';
import {
  Product,
  Store,
  StoreInventoryItem,
  User
} from '../types/inventory';
import { formatCode7Display, formatCOP } from '../utils/code7';

interface LowStockAlertsViewProps {
  currentStore: Store;
  allStores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  currentUser: User;
  onRequestTransferForSku: (sku: string, fromStoreId?: string) => void;
  onQuickInbound: (sku: string) => void;
}

export const LowStockAlertsView: React.FC<LowStockAlertsViewProps> = ({
  currentStore,
  allStores,
  products,
  inventory,
  currentUser,
  onRequestTransferForSku,
  onQuickInbound
}) => {
  const [filterStoreId, setFilterStoreId] = useState<string>(currentStore.id);

  const selectedStore = allStores.find((s) => s.id === filterStoreId) || currentStore;

  // Filter items that are at or below threshold
  const lowStockItems = inventory.filter((item) => {
    if (filterStoreId !== 'all' && item.storeId !== filterStoreId) return false;
    return item.quantity <= item.minStockAlert;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Monitoreo Proactivo de Reposición
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Alertas de Inventario Bajo & Quiebres de Stock
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Avisos automáticos según los umbrales mínimos configurados por prenda
          </p>
        </div>

        {/* Store filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 font-semibold hidden sm:inline">
            Filtrar por Tienda:
          </label>
          <select
            value={filterStoreId}
            onChange={(e) => setFilterStoreId(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500 font-semibold"
          >
            <option value="all">Todas las Tiendas (Red Aburrá)</option>
            {allStores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.municipality})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 font-sans block uppercase">
              Total Referencias Críticas
            </span>
            <span className="text-xl font-black text-amber-400">{lowStockItems.length} SKUs</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 font-sans block uppercase">
              Agotados Totales (0 unids)
            </span>
            <span className="text-xl font-black text-red-500">
              {lowStockItems.filter((i) => i.quantity === 0).length} SKUs
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <PackageX className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 font-sans block uppercase">
              Punto de Venta Consultado
            </span>
            <span className="text-sm font-bold text-white font-sans truncate max-w-[150px]">
              {filterStoreId === 'all' ? 'Toda la Red Aburrá' : selectedStore.name}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Critical Stock List */}
      <div className="space-y-3">
        {lowStockItems.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-neutral-200">
              ¡Inventario en niveles óptimos!
            </h3>
            <p className="text-xs text-neutral-500">
              No hay prendas con existencias por debajo del umbral mínimo configurado para este punto.
            </p>
          </div>
        ) : (
          lowStockItems.map((item) => {
            const prod = products.find((p) => p.id === item.productId);
            const store = allStores.find((s) => s.id === item.storeId);

            // Find other stores that have this SKU in stock to suggest transfers!
            const alternativeStores = inventory
              .filter((i) => i.sku === item.sku && i.storeId !== item.storeId && i.quantity > 0)
              .map((i) => ({
                store: allStores.find((s) => s.id === i.storeId),
                qty: i.quantity
              }))
              .filter((a) => a.store !== undefined);

            const isOut = item.quantity === 0;

            return (
              <div
                key={`${item.storeId}-${item.sku}`}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOut
                    ? 'bg-red-950/20 border-red-800/80 shadow-sm'
                    : 'bg-neutral-900/70 border-amber-900/40 hover:border-amber-700/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isOut
                        ? 'bg-red-600/20 border-red-500/30 text-red-500'
                        : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {item.quantity}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {formatCode7Display(item.code7)}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.productName}</h4>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          isOut
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {isOut ? 'Agotado (0)' : `Bajo Umbral (Mín: ${item.minStockAlert})`}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>
                        Tienda: <strong className="text-neutral-200">{store?.name}</strong> ({store?.municipality})
                      </span>
                      <span>
                        Talla: <strong className="text-white">{item.size}</strong>
                      </span>
                      <span>
                        Color: <strong className="text-white">{item.color}</strong>
                      </span>
                      <span className="font-mono text-neutral-500">SKU: {item.sku}</span>
                    </div>

                    {/* Stores with stock available for transfer */}
                    {alternativeStores.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
                        <span className="text-neutral-500">Disponible para traslado desde:</span>
                        {alternativeStores.map((alt) => (
                          <button
                            key={alt.store!.id}
                            onClick={() => onRequestTransferForSku(item.sku, alt.store!.id)}
                            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-red-500 font-mono transition flex items-center gap-1"
                          >
                            <span>{alt.store!.shortCode}:</span>
                            <strong className="text-emerald-400">{alt.qty} unids</strong>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick actions for replenishment */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/80">
                  <button
                    onClick={() => onRequestTransferForSku(item.sku)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 rounded-xl text-xs font-semibold transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Pedir Traslado</span>
                  </button>

                  <button
                    onClick={() => onQuickInbound(item.sku)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Ingresar Stock (+)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
