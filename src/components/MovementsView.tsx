import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  History,
  FileText,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Tag,
  Building2
} from 'lucide-react';
import {
  Product,
  Store,
  StoreInventoryItem,
  MovementRecord,
  MovementType,
  User,
  Size
} from '../types/inventory';
import { formatCOP, formatCode7Display } from '../utils/code7';

interface MovementsViewProps {
  currentStore: Store;
  allStores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  movements: MovementRecord[];
  currentUser: User;
  onExecuteMovement: (params: {
    type: MovementType;
    storeId: string;
    sku: string;
    quantity: number;
    user: User;
    reason: string;
    referenceDoc?: string;
    notes?: string;
  }) => { success: boolean; error?: string };
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  currentStore,
  allStores,
  products,
  inventory,
  movements,
  currentUser,
  onExecuteMovement
}) => {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound' | 'returns' | 'history'>('history');

  // Form states for Inbound
  const [inboundProductId, setInboundProductId] = useState(products[0]?.id || '');
  const [inboundSku, setInboundSku] = useState(products[0]?.variants[0]?.sku || '');
  const [inboundQty, setInboundQty] = useState(10);
  const [inboundSupplier, setInboundSupplier] = useState('Confecciones y Textiles del Valle S.A.S.');
  const [inboundDoc, setInboundDoc] = useState('FAC-PROV-');
  const [inboundNotes, setInboundNotes] = useState('');

  // Form states for Outbound
  const [outboundProductId, setOutboundProductId] = useState(products[0]?.id || '');
  const [outboundSku, setOutboundSku] = useState(products[0]?.variants[0]?.sku || '');
  const [outboundQty, setOutboundQty] = useState(1);
  const [outboundReasonType, setOutboundReasonType] = useState<MovementType>('SALIDA_VENTA');
  const [outboundDoc, setOutboundDoc] = useState('POS-VTA-');
  const [outboundReasonText, setOutboundReasonText] = useState('Venta presencial mostrador');

  // Form states for Returns
  const [returnProductId, setReturnProductId] = useState(products[0]?.id || '');
  const [returnSku, setReturnSku] = useState(products[0]?.variants[0]?.sku || '');
  const [returnQty, setReturnQty] = useState(1);
  const [returnCondition, setReturnCondition] = useState<'apto_stock' | 'danado_merma'>('apto_stock');
  const [returnReason, setReturnReason] = useState('Cambio por inconformidad de talla');
  const [returnCustomerDoc, setReturnCustomerDoc] = useState('TIK-DEV-');

  // Audit history filter states
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const [historyStoreFilter, setHistoryStoreFilter] = useState<string>('all');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected products
  const selectedInboundProd = products.find((p) => p.id === inboundProductId) || products[0];
  const selectedOutboundProd = products.find((p) => p.id === outboundProductId) || products[0];
  const selectedReturnProd = products.find((p) => p.id === returnProductId) || products[0];

  // Stock for outbound validation
  const currentOutboundStock =
    inventory.find((i) => i.storeId === currentStore.id && i.sku === outboundSku)?.quantity || 0;

  // Handle Inbound Submit
  const handleInboundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const res = onExecuteMovement({
      type: 'ENTRADA',
      storeId: currentStore.id,
      sku: inboundSku,
      quantity: Number(inboundQty),
      user: currentUser,
      reason: `Ingreso Proveedor: ${inboundSupplier}`,
      referenceDoc: inboundDoc,
      notes: inboundNotes || 'Ingreso registrado mediante módulo de entradas.'
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: `¡Entrada exitosa! Se añadieron +${inboundQty} unidades de SKU ${inboundSku} a ${currentStore.name}.`
      });
      setInboundNotes('');
    } else {
      setNotification({ type: 'error', message: res.error || 'Error al registrar entrada.' });
    }
  };

  // Handle Outbound Submit
  const handleOutboundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const res = onExecuteMovement({
      type: outboundReasonType,
      storeId: currentStore.id,
      sku: outboundSku,
      quantity: Number(outboundQty),
      user: currentUser,
      reason: outboundReasonText,
      referenceDoc: outboundDoc,
      notes: `Salida autorizada por ${currentUser.name}`
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: `¡Salida registrada! Se descontaron -${outboundQty} unidades de ${currentStore.name}.`
      });
    } else {
      setNotification({ type: 'error', message: res.error || 'Error al registrar salida.' });
    }
  };

  // Handle Returns Submit
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (returnCondition === 'apto_stock') {
      // Re-enters stock
      const res = onExecuteMovement({
        type: 'DEVOLUCION_CLIENTE',
        storeId: currentStore.id,
        sku: returnSku,
        quantity: Number(returnQty),
        user: currentUser,
        reason: `Devolución de cliente (Reingreso a stock disponible): ${returnReason}`,
        referenceDoc: returnCustomerDoc,
        notes: 'Prenda verificada en buen estado con etiquetas intactas.'
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: `Devolución procesada. +${returnQty} unidades reincorporadas al inventario disponible de ${currentStore.name}.`
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Error al procesar devolución.' });
      }
    } else {
      // Damaged - doesn't re-enter salable stock, registers defect exit/quarantine
      const res = onExecuteMovement({
        type: 'SALIDA_DEFECTO',
        storeId: currentStore.id,
        sku: returnSku,
        quantity: Number(returnQty),
        user: currentUser,
        reason: `Devolución por prenda defectuosa/dañada (No apta para venta): ${returnReason}`,
        referenceDoc: returnCustomerDoc,
        notes: 'Destinada a merma o devolución a fábrica textil.'
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: `Devolución por defecto registrada. La prenda se envía a merma sin afectar el stock apto para venta.`
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Error al registrar defecto.' });
      }
    }
  };

  // Filter history
  const filteredHistory = movements.filter((m) => {
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      const match =
        m.code.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.productName.toLowerCase().includes(q) ||
        m.userName.toLowerCase().includes(q) ||
        (m.referenceDoc && m.referenceDoc.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (historyTypeFilter !== 'all' && m.type !== historyTypeFilter) return false;
    if (historyStoreFilter !== 'all' && m.storeId !== historyStoreFilter) return false;

    return true;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'Código Movimiento',
      'Fecha ISO',
      'Tipo Movimiento',
      'Tienda',
      'SKU',
      'Código 7D',
      'Prenda',
      'Talla',
      'Color',
      'Cantidad',
      'Delta',
      'Stock Anterior',
      'Stock Nuevo',
      'Usuario',
      'Rol',
      'Documento Referencia',
      'Motivo'
    ];

    const rows = filteredHistory.map((m) => [
      m.code,
      m.timestamp,
      m.type,
      `"${m.storeName}"`,
      m.sku,
      m.code7,
      `"${m.productName}"`,
      m.size,
      `"${m.color}"`,
      m.quantity,
      m.delta,
      m.previousStock,
      m.newStock,
      `"${m.userName}"`,
      m.userRole,
      `"${m.referenceDoc || ''}"`,
      `"${m.reason}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_movimientos_ANB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header and sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Operaciones de Mercancía & Trazabilidad
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Entradas, Salidas & Historial de Auditoría
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Registro con usuario responsable, fecha, motivo y actualización automática de existencias
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => {
              setActiveTab('history');
              setNotification(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditoría ({movements.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('inbound');
              setNotification(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inbound' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Entrada (+)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('outbound');
              setNotification(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'outbound' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Salida (-)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('returns');
              setNotification(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'returns' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Devoluciones</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
            notification.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/70 border border-red-800 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TAB 1: INBOUND GOODS FORM */}
      {activeTab === 'inbound' && (
        <div className="bg-neutral-900/70 border border-neutral-800 p-5 rounded-2xl max-w-2xl mx-auto space-y-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                Registrar Entrada de Mercancía
              </h3>
              <p className="text-xs text-neutral-400">
                Destino de ingreso: <strong className="text-white">{currentStore.name}</strong>
              </p>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
              Operador: {currentUser.name}
            </span>
          </div>

          <form onSubmit={handleInboundSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Prenda / Referencia</label>
                <select
                  value={inboundProductId}
                  onChange={(e) => {
                    setInboundProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod && prod.variants[0]) {
                      setInboundSku(prod.variants[0].sku);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code7} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Variante Talla / Color</label>
                <select
                  value={inboundSku}
                  onChange={(e) => setInboundSku(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                >
                  {selectedInboundProd?.variants.map((v) => (
                    <option key={v.sku} value={v.sku}>
                      {v.size} ({v.color}) - SKU: {v.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Cantidad a Ingresar *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={inboundQty}
                  onChange={(e) => setInboundQty(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Factura / Remisión Origen</label>
                <input
                  type="text"
                  value={inboundDoc}
                  onChange={(e) => setInboundDoc(e.target.value)}
                  placeholder="FAC-PROV-1029"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-300 mb-1">Proveedor u Origen</label>
                <input
                  type="text"
                  value={inboundSupplier}
                  onChange={(e) => setInboundSupplier(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-300 mb-1">Observaciones / Lote</label>
                <textarea
                  rows={2}
                  value={inboundNotes}
                  onChange={(e) => setInboundNotes(e.target.value)}
                  placeholder="Detalles de embalaje, lote de confección o estado de la entrega."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-xs"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Registrar Entrada de Mercancía (+)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: OUTBOUND GOODS FORM */}
      {activeTab === 'outbound' && (
        <div className="bg-neutral-900/70 border border-neutral-800 p-5 rounded-2xl max-w-2xl mx-auto space-y-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                Registrar Salida de Mercancía
              </h3>
              <p className="text-xs text-neutral-400">
                Punto de salida: <strong className="text-white">{currentStore.name}</strong>
              </p>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
              Operador: {currentUser.name}
            </span>
          </div>

          <form onSubmit={handleOutboundSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Prenda / Referencia</label>
                <select
                  value={outboundProductId}
                  onChange={(e) => {
                    setOutboundProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod && prod.variants[0]) {
                      setOutboundSku(prod.variants[0].sku);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code7} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Variante Talla / Color</label>
                <select
                  value={outboundSku}
                  onChange={(e) => setOutboundSku(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                >
                  {selectedOutboundProd?.variants.map((v) => (
                    <option key={v.sku} value={v.sku}>
                      {v.size} ({v.color}) - SKU: {v.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Cantidad a Salir (Stock Actual: <strong className="text-white font-mono">{currentOutboundStock}</strong>) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentOutboundStock}
                  required
                  value={outboundQty}
                  onChange={(e) => setOutboundQty(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Motivo de Salida</label>
                <select
                  value={outboundReasonType}
                  onChange={(e) => setOutboundReasonType(e.target.value as MovementType)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  <option value="SALIDA_VENTA">Venta mostrador</option>
                  <option value="SALIDA_PERDIDA">Pérdida / Merma operativa</option>
                  <option value="SALIDA_DEFECTO">Daño / Defecto de confección</option>
                  <option value="SALIDA_DONACION">Muestra / Donación</option>
                  <option value="DEVOLUCION_PROVEEDOR">Devolución a proveedor textil</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-300 mb-1">Documento / Factura POS</label>
                <input
                  type="text"
                  value={outboundDoc}
                  onChange={(e) => setOutboundDoc(e.target.value)}
                  placeholder="POS-VTA-4491"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-300 mb-1">Detalle del Motivo</label>
                <input
                  type="text"
                  value={outboundReasonText}
                  onChange={(e) => setOutboundReasonText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={currentOutboundStock <= 0}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20 flex items-center gap-2 text-xs"
              >
                <ArrowUpRight className="w-4 h-4" />
                Registrar Salida de Mercancía (-)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RETURNS FORM */}
      {activeTab === 'returns' && (
        <div className="bg-neutral-900/70 border border-neutral-800 p-5 rounded-2xl max-w-2xl mx-auto space-y-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                Registro de Devoluciones (Clientes / Garantías)
              </h3>
              <p className="text-xs text-neutral-400">
                Punto receptor: <strong className="text-white">{currentStore.name}</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Prenda Devuelta</label>
                <select
                  value={returnProductId}
                  onChange={(e) => {
                    setReturnProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod && prod.variants[0]) {
                      setReturnSku(prod.variants[0].sku);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code7} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Variante Talla / Color</label>
                <select
                  value={returnSku}
                  onChange={(e) => setReturnSku(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                >
                  {selectedReturnProd?.variants.map((v) => (
                    <option key={v.sku} value={v.sku}>
                      {v.size} ({v.color}) - SKU: {v.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Cantidad Devuelta *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Tiquete / Factura Original</label>
                <input
                  type="text"
                  value={returnCustomerDoc}
                  onChange={(e) => setReturnCustomerDoc(e.target.value)}
                  placeholder="TIK-DEV-9021"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Disposition Rule from Section 11 */}
              <div className="sm:col-span-2 space-y-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="font-bold text-neutral-200 block">
                  Estado de la Prenda & Efecto en el Inventario (Requerimiento Sección 11):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      returnCondition === 'apto_stock'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnCondition"
                      className="hidden"
                      checked={returnCondition === 'apto_stock'}
                      onChange={() => setReturnCondition('apto_stock')}
                    />
                    <div className="font-bold text-xs">Apta para reingreso a stock (+)</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      Prenda intacta, con etiqueta. Suma de inmediato al stock disponible.
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      returnCondition === 'danado_merma'
                        ? 'bg-red-950/40 border-red-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnCondition"
                      className="hidden"
                      checked={returnCondition === 'danado_merma'}
                      onChange={() => setReturnCondition('danado_merma')}
                    />
                    <div className="font-bold text-xs">Dañada / Defectuosa (Merma)</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      No apta para venta. Se registra en auditoría sin sumar al stock comercial.
                    </div>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-300 mb-1">Motivo de Devolución</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-lg shadow-amber-600/20 flex items-center gap-2 text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                Registrar Devolución
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: AUDIT HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History filter toolbar */}
          <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar por comprobante, SKU, prenda, usuario..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:outline-none font-mono"
                />
              </div>

              <select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">Todos los Tipos</option>
                <option value="ENTRADA">Entradas (+)</option>
                <option value="SALIDA_VENTA">Ventas (-)</option>
                <option value="TRANSFERENCIA_SALIDA">Transferencia Salida (-)</option>
                <option value="TRANSFERENCIA_ENTRADA">Transferencia Entrada (+)</option>
                <option value="AJUSTE_CONTEO_POSITIVO">Ajuste Conteo (+)</option>
                <option value="AJUSTE_CONTEO_NEGATIVO">Ajuste Conteo (-)</option>
                <option value="DEVOLUCION_CLIENTE">Devoluciones (+)</option>
                <option value="SALIDA_DEFECTO">Defectos / Merma (-)</option>
              </select>

              <select
                value={historyStoreFilter}
                onChange={(e) => setHistoryStoreFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">Todas las Tiendas</option>
                {allStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-red-500" />
              <span>Exportar CSV Auditoría</span>
            </button>
          </div>

          {/* Movements audit table */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] uppercase font-bold text-neutral-500">
                    <th className="py-3 px-3">Comprobante / Fecha</th>
                    <th className="py-3 px-3">Tipo Movimiento</th>
                    <th className="py-3 px-3">Tienda</th>
                    <th className="py-3 px-3">Prenda & SKU</th>
                    <th className="py-3 px-3 text-center">Variación</th>
                    <th className="py-3 px-3 text-right">Saldo Final</th>
                    <th className="py-3 px-3">Usuario & Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {filteredHistory.map((mov) => {
                    const isPositive = mov.delta > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-neutral-950/60 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-neutral-200">{mov.code}</div>
                          <div className="text-[10px] text-neutral-500 font-sans">
                            {new Date(mov.timestamp).toLocaleString('es-CO', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isPositive
                                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                                : 'bg-red-950/70 text-red-400 border-red-800'
                            }`}
                          >
                            {mov.type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-sans">
                          <div className="font-semibold text-white truncate max-w-[130px]">
                            {mov.storeName}
                          </div>
                          {mov.targetStoreName && (
                            <div className="text-[10px] text-amber-400">
                              ➡️ {mov.targetStoreName}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 font-sans">
                          <div className="font-bold text-neutral-200 truncate max-w-[160px]">
                            {mov.productName}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {mov.sku} ({mov.size})
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-black text-xs ${
                              isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="text-neutral-400 text-[10px]">
                            {mov.previousStock} ➔
                          </span>{' '}
                          <strong className="text-white text-xs font-bold">{mov.newStock}</strong>
                        </td>

                        <td className="py-3 px-3 font-sans">
                          <div className="font-semibold text-neutral-300 flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-neutral-500" />
                            {mov.userName}
                          </div>
                          <div className="text-[11px] text-neutral-400 italic line-clamp-1">
                            {mov.reason}
                          </div>
                          {mov.referenceDoc && (
                            <div className="text-[10px] text-neutral-500 font-mono">
                              Ref: {mov.referenceDoc}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
