import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Printer,
  Camera,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Store as StoreIcon,
  Tag
} from 'lucide-react';
import {
  Product,
  Store,
  StoreInventoryItem,
  SeasonCollection,
  PRODUCT_GROUPS,
  GARMENT_TYPES,
  SIZES,
  COLORS,
  User,
  Size,
  ProductVariant
} from '../types/inventory';
import { formatCOP, formatCode7Display } from '../utils/code7';
import { BarcodeRenderer } from './BarcodeRenderer';

interface InventoryViewProps {
  currentStore: Store;
  allStores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  seasons: SeasonCollection[];
  currentUser: User;
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onToggleProductActive: (productId: string) => void;
  onOpenLabelPrinter: (product?: Product, variant?: ProductVariant) => void;
  onQuickMovement: (type: 'ENTRADA' | 'SALIDA_VENTA', sku: string, qty: number, reason: string) => void;
  onRequestTransferForSku: (sku: string, fromStoreId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  currentStore,
  allStores,
  products,
  inventory,
  seasons,
  currentUser,
  onOpenNewProduct,
  onEditProduct,
  onToggleProductActive,
  onOpenLabelPrinter,
  onQuickMovement,
  onRequestTransferForSku
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'current_store' | 'all_stores'>('current_store');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(products[0]?.id || null);

  // Quick inline adjustment state
  const [inlineAdjustSku, setInlineAdjustSku] = useState<string | null>(null);
  const [inlineQty, setInlineQty] = useState(1);
  const [inlineAction, setInlineAction] = useState<'ENTRADA' | 'SALIDA_VENTA'>('ENTRADA');

  // Filter products
  const filteredProducts = products.filter((prod) => {
    // Search query matches code7, name, description or any variant SKU / barcode
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match7 = prod.code7.toLowerCase().includes(q);
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchVariant = prod.variants.some(
        (v) => v.sku.toLowerCase().includes(q) || v.barcode.toLowerCase().includes(q)
      );

      if (!match7 && !matchName && !matchDesc && !matchVariant) {
        return false;
      }
    }

    if (selectedGroup !== 'all' && prod.groupCode !== selectedGroup) return false;
    if (selectedType !== 'all' && prod.typeCode !== selectedType) return false;
    if (selectedSeason !== 'all' && prod.seasonId !== selectedSeason) return false;

    if (selectedSize !== 'all' && !prod.availableSizes.includes(selectedSize as Size)) {
      return false;
    }

    if (onlyLowStock) {
      const storeInv = inventory.filter((i) => i.productId === prod.id && (viewScope === 'current_store' ? i.storeId === currentStore.id : true));
      const hasLowStockVariant = storeInv.some((i) => i.quantity <= i.minStockAlert);
      if (!hasLowStockVariant) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Catálogo de Prendas & Existencias
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Inventario por Tienda, Talla y Color
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Consulta en tiempo real en los 6 puntos de venta del Valle de Aburrá
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Scope Toggle */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setViewScope('current_store')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewScope === 'current_store'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>{currentStore.shortCode} ({currentStore.municipality.split(' ')[0]})</span>
            </button>
            <button
              onClick={() => setViewScope('all_stores')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewScope === 'all_stores'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Toda la Red Aburrá</span>
            </button>
          </div>

          {currentUser.role === 'admin_general' && (
            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              Nueva Prenda 7D
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por código 7D (3103015), barcode, nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700/80 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          {/* Group filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:border-red-500 focus:outline-none"
            >
              <option value="all">Todos los Grupos (GG)</option>
              {Object.values(PRODUCT_GROUPS).map((g) => (
                <option key={g.code} value={g.code}>
                  {g.code} - {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Garment type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:border-red-500 focus:outline-none"
            >
              <option value="all">Tipo de Prenda (TT)</option>
              {Object.values(GARMENT_TYPES).map((t) => (
                <option key={t.code} value={t.code}>
                  {t.code} - {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Size filter */}
          <div>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:border-red-500 focus:outline-none"
            >
              <option value="all">Todas las Tallas</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  Talla {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="accent-red-600 rounded w-4 h-4"
              />
              <span className={onlyLowStock ? 'text-amber-400 font-bold' : ''}>
                Solo existencias bajas (Alerta de reposición)
              </span>
            </label>

            <span className="text-neutral-600">|</span>

            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="all">Todas las Temporadas / Colecciones</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="font-mono text-neutral-400">
            Mostrando <strong className="text-white">{filteredProducts.length}</strong> de {products.length} prendas
          </div>
        </div>
      </div>

      {/* Products List & Variants Matrix */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl space-y-3">
            <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-base font-bold text-neutral-300">No se encontraron prendas con esos filtros</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Intenta borrar el término de búsqueda o seleccionar &quot;Todos los Grupos&quot;.
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isExpanded = expandedProductId === product.id;

            // Total stock in current store
            const currentStoreProductStock = inventory
              .filter((i) => i.productId === product.id && i.storeId === currentStore.id)
              .reduce((acc, curr) => acc + curr.quantity, 0);

            // Total stock in all stores
            const allStoresProductStock = inventory
              .filter((i) => i.productId === product.id)
              .reduce((acc, curr) => acc + curr.quantity, 0);

            const hasLowStockInCurrent = inventory.some(
              (i) => i.productId === product.id && i.storeId === currentStore.id && i.quantity <= i.minStockAlert
            );

            return (
              <div
                key={product.id}
                className={`bg-neutral-900/70 border rounded-2xl transition overflow-hidden ${
                  isExpanded ? 'border-neutral-700 shadow-xl' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Product Summary Header Card */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-950/60">
                  <div className="flex items-start gap-3.5">
                    {/* 7-digit code box */}
                    <div className="text-center shrink-0">
                      <div className="font-mono text-xs font-black tracking-wider px-2.5 py-1.5 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
                        {formatCode7Display(product.code7)}
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase mt-1 block">
                        7 Dígitos
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{product.name}</h3>
                        {!product.active && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                            Inactivo
                          </span>
                        )}
                        {hasLowStockInCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Stock Bajo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                        {product.description} · Colección: <strong className="text-neutral-300">{product.seasonName}</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-2 font-mono">
                        <span>P. Venta: <strong className="text-emerald-400 font-semibold">{formatCOP(product.price)}</strong></span>
                        <span>Costo: <strong className="text-neutral-400">{formatCOP(product.cost)}</strong></span>
                        <span>Margen: <strong className="text-cyan-400">{Math.round(((product.price - product.cost) / product.price) * 100)}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Counters & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-neutral-500 uppercase block font-semibold">
                        {viewScope === 'current_store' ? `En ${currentStore.shortCode}` : 'Red Aburrá'}
                      </span>
                      <div className="text-lg font-black font-mono text-white">
                        {viewScope === 'current_store' ? currentStoreProductStock : allStoresProductStock}
                        <span className="text-xs text-neutral-500 font-normal ml-1 font-sans">
                          {viewScope === 'current_store' ? `(${allStoresProductStock} en red)` : 'unids.'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenLabelPrinter(product)}
                        title="Imprimir etiquetas de esta prenda"
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {currentUser.role === 'admin_general' && (
                        <button
                          onClick={() => onEditProduct(product)}
                          title="Editar clasificación y precios"
                          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition"
                        >
                          Editar
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        <span>{isExpanded ? 'Ocultar Matriz' : 'Ver Tallas & Stock'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDED SIZING & COLOR MATRIX */}
                {isExpanded && (
                  <div className="border-t border-neutral-800 p-4 sm:p-5 bg-neutral-950/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-red-500" />
                          Desglose por Variante SKU (Talla / Color)
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Existencias físicas distribuidas en cada tienda del Valle de Aburrá
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">
                          {product.variants.length} SKUs activos
                        </span>
                      </div>
                    </div>

                    {/* Variants Table / Grid */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-500">
                            <th className="py-2.5 px-3">Variante / SKU</th>
                            <th className="py-2.5 px-3">Talla & Color</th>
                            <th className="py-2.5 px-3 text-center">Código de Barras</th>
                            <th className="py-2.5 px-3 text-right">
                              Stock en {currentStore.shortCode}
                            </th>
                            <th className="py-2.5 px-3 text-center">
                              Disponibilidad en Otras Tiendas (Aburrá)
                            </th>
                            <th className="py-2.5 px-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60 font-mono">
                          {product.variants.map((variant) => {
                            const currentStock =
                              inventory.find(
                                (i) => i.storeId === currentStore.id && i.sku === variant.sku
                              )?.quantity || 0;

                            const otherStores = allStores.filter((s) => s.id !== currentStore.id);

                            return (
                              <tr
                                key={variant.sku}
                                className="hover:bg-neutral-900/40 transition"
                              >
                                {/* SKU */}
                                <td className="py-3 px-3">
                                  <span className="font-bold text-neutral-200">{variant.sku}</span>
                                </td>

                                {/* Size & Color */}
                                <td className="py-3 px-3 font-sans">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0"
                                      style={{ backgroundColor: variant.colorHex }}
                                    />
                                    <div>
                                      <span className="font-bold text-white block">
                                        Talla {variant.size}
                                      </span>
                                      <span className="text-[11px] text-neutral-400">
                                        {variant.color}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Barcode code & preview */}
                                <td className="py-3 px-3 text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <BarcodeRenderer
                                      value={variant.barcode || variant.sku}
                                      width={1}
                                      height={22}
                                      fontSize={8}
                                      displayValue={true}
                                    />
                                  </div>
                                </td>

                                {/* Current store stock */}
                                <td className="py-3 px-3 text-right">
                                  <div className="font-bold text-sm">
                                    <span
                                      className={
                                        currentStock <= product.minStockAlert
                                          ? currentStock === 0
                                            ? 'text-red-500'
                                            : 'text-amber-400'
                                          : 'text-emerald-400'
                                      }
                                    >
                                      {currentStock}
                                    </span>
                                    <span className="text-[10px] text-neutral-500 font-sans ml-1">
                                      unids
                                    </span>
                                  </div>
                                  {currentStock <= product.minStockAlert && (
                                    <span className="text-[9px] text-amber-500 uppercase font-bold tracking-tight block">
                                      {currentStock === 0 ? 'Agotado' : 'Bajo Umbral'}
                                    </span>
                                  )}
                                </td>

                                {/* Other stores availability badges */}
                                <td className="py-3 px-3">
                                  <div className="flex flex-wrap justify-center gap-1.5 font-sans">
                                    {otherStores.map((st) => {
                                      const stStock =
                                        inventory.find(
                                          (i) => i.storeId === st.id && i.sku === variant.sku
                                        )?.quantity || 0;

                                      return (
                                        <button
                                          key={st.id}
                                          onClick={() => {
                                            if (stStock > 0 && currentStock === 0) {
                                              onRequestTransferForSku(variant.sku, st.id);
                                            }
                                          }}
                                          title={`Existencias en ${st.name}: ${stStock} unids. ${
                                            stStock > 0 ? 'Click para solicitar traslado' : ''
                                          }`}
                                          className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 font-mono transition ${
                                            stStock > 0
                                              ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-red-500 cursor-pointer'
                                              : 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-default'
                                          }`}
                                        >
                                          <span className="text-[9px] uppercase font-bold text-neutral-400">
                                            {st.shortCode}:
                                          </span>
                                          <strong
                                            className={
                                              stStock > 0 ? 'text-white' : 'text-neutral-600'
                                            }
                                          >
                                            {stStock}
                                          </strong>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-3 text-right font-sans">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Quick + / - modal triggers */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInlineAdjustSku(variant.sku);
                                        setInlineAction('ENTRADA');
                                        setInlineQty(1);
                                      }}
                                      title="Ingreso rápido (+)"
                                      className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800 rounded-lg transition"
                                    >
                                      <ArrowDownLeft className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={currentStock <= 0}
                                      onClick={() => {
                                        setInlineAdjustSku(variant.sku);
                                        setInlineAction('SALIDA_VENTA');
                                        setInlineQty(1);
                                      }}
                                      title="Salida / Venta rápida (-)"
                                      className="p-1.5 bg-red-950/60 hover:bg-red-900/60 disabled:opacity-30 text-red-400 border border-red-800 rounded-lg transition"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onOpenLabelPrinter(product, variant)}
                                      title="Imprimir etiqueta individual de este SKU"
                                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-lg transition"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onRequestTransferForSku(variant.sku)}
                                      title="Solicitar transferencia a otra tienda"
                                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded-lg transition"
                                    >
                                      <ArrowRightLeft className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Inline Quick Adjustment Sub-bar */}
                    {inlineAdjustSku && (
                      <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                              inlineAction === 'ENTRADA'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {inlineAction === 'ENTRADA' ? 'Entrada (+)' : 'Salida / Venta (-)'}
                          </span>
                          <span className="font-mono text-neutral-300">{inlineAdjustSku}</span>
                          <span className="text-neutral-500">en {currentStore.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Cantidad:</span>
                          <div className="flex items-center border border-neutral-700 rounded bg-black">
                            <button
                              type="button"
                              onClick={() => setInlineQty(Math.max(1, inlineQty - 1))}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-mono font-bold text-white min-w-[28px] text-center">
                              {inlineQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setInlineQty(inlineQty + 1)}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onQuickMovement(
                                inlineAction,
                                inlineAdjustSku,
                                inlineQty,
                                inlineAction === 'ENTRADA'
                                  ? 'Ingreso rápido de mercancía mostrador'
                                  : 'Venta rápida mostrador'
                              );
                              setInlineAdjustSku(null);
                            }}
                            className={`px-3 py-1 font-bold rounded-lg text-white transition ${
                              inlineAction === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                            }`}
                          >
                            Confirmar
                          </button>

                          <button
                            type="button"
                            onClick={() => setInlineAdjustSku(null)}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
