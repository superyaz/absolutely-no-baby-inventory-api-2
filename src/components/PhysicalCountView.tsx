import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  Play,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';
import {
  PhysicalCountAudit,
  PhysicalCountItem,
  Store,
  Product,
  StoreInventoryItem,
  User
} from '../types/inventory';
import { formatCOP, formatCode7Display } from '../utils/code7';

interface PhysicalCountViewProps {
  currentStore: Store;
  allStores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  audits: PhysicalCountAudit[];
  currentUser: User;
  onSaveAudit: (audit: PhysicalCountAudit) => void;
  onApplyAdjustment: (auditId: string, user: User, reason: string) => { success: boolean; error?: string };
}

export const PhysicalCountView: React.FC<PhysicalCountViewProps> = ({
  currentStore,
  allStores,
  products,
  inventory,
  audits,
  currentUser,
  onSaveAudit,
  onApplyAdjustment
}) => {
  const [activeAuditId, setActiveAuditId] = useState<string | null>(audits[0]?.id || null);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [adjustmentReasonText, setAdjustmentReasonText] = useState('');
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeAudit = audits.find((a) => a.id === activeAuditId);

  // Create new physical count session
  const handleStartNewCount = (storeId: string) => {
    const store = allStores.find((s) => s.id === storeId) || currentStore;
    const storeItems = inventory.filter((i) => i.storeId === store.id);

    const countItems: PhysicalCountItem[] = storeItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        sku: item.sku,
        code7: item.code7,
        productName: item.productName,
        size: item.size,
        color: item.color,
        systemQty: item.quantity,
        countedQty: item.quantity, // initialized to system count for rapid verification
        variance: 0,
        unitCost: prod?.cost || 18500,
        totalVarianceValue: 0,
        verified: false
      };
    });

    const newAudit: PhysicalCountAudit = {
      id: `audit-${Date.now()}`,
      code: `AUD-${store.shortCode}-${new Date().toISOString().slice(2, 7).replace('-', '')}`,
      storeId: store.id,
      storeName: store.name,
      startedAt: new Date().toISOString(),
      status: 'EN_PROCESO',
      auditorId: currentUser.id,
      auditorName: currentUser.name,
      adjustmentApplied: false,
      items: countItems
    };

    onSaveAudit(newAudit);
    setActiveAuditId(newAudit.id);
    setShowNewAuditModal(false);
    setNotification({
      type: 'success',
      message: `Nueva sesión de conteo físico iniciada para ${store.name}.`
    });
  };

  const handleUpdateItemCounted = (sku: string, newCountedQty: number) => {
    if (!activeAudit || activeAudit.adjustmentApplied) return;

    const updatedItems = activeAudit.items.map((item) => {
      if (item.sku === sku) {
        const qty = Math.max(0, newCountedQty);
        const variance = qty - item.systemQty;
        const totalVarianceValue = variance * item.unitCost;
        return {
          ...item,
          countedQty: qty,
          variance,
          totalVarianceValue,
          verified: true
        };
      }
      return item;
    });

    const updatedAudit: PhysicalCountAudit = {
      ...activeAudit,
      items: updatedItems
    };

    onSaveAudit(updatedAudit);
  };

  const handleApplyAdjustmentSubmit = () => {
    if (!activeAudit) return;

    if (!adjustmentReasonText.trim()) {
      setNotification({ type: 'error', message: 'Debes indicar el motivo formal del ajuste para auditoría.' });
      return;
    }

    const res = onApplyAdjustment(activeAudit.id, currentUser, adjustmentReasonText.trim());
    if (res.success) {
      setNotification({
        type: 'success',
        message: '¡Ajuste de inventario aplicado con éxito! Los saldos han sido actualizados en la base de datos.'
      });
      setShowApplyConfirm(false);
      setAdjustmentReasonText('');
    } else {
      setNotification({ type: 'error', message: res.error || 'Error al aplicar el ajuste.' });
    }
  };

  // Calculations for active audit
  const totalVarianceQty = activeAudit
    ? activeAudit.items.reduce((acc, curr) => acc + curr.variance, 0)
    : 0;

  const totalVarianceCost = activeAudit
    ? activeAudit.items.reduce((acc, curr) => acc + curr.totalVarianceValue, 0)
    : 0;

  const discrepanciesCount = activeAudit
    ? activeAudit.items.filter((i) => i.variance !== 0).length
    : 0;

  const canApplyAdjustment =
    (currentUser.role === 'admin_general' || currentUser.role === 'admin_tienda') &&
    activeAudit &&
    !activeAudit.adjustmentApplied &&
    discrepanciesCount > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Control de Pérdidas & Cuadre de Existencias
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Conteos Físicos & Ajustes de Inventario
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Comparativa asistida: Cantidad física escaneada vs Cantidad teórica del sistema
          </p>
        </div>

        <button
          onClick={() => setShowNewAuditModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Conteo Físico</span>
        </button>
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

      {/* Audits Selector & Session Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Column: List of Audit Sessions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Historial de Sesiones
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">{audits.length} sesiones</span>
          </div>

          <div className="space-y-2">
            {audits.map((a) => {
              const isSelected = a.id === activeAuditId;
              const hasDiff = a.items.some((i) => i.variance !== 0);

              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setActiveAuditId(a.id);
                    setNotification(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-neutral-900 border-red-500 shadow-md'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{a.code}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        a.adjustmentApplied
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {a.adjustmentApplied ? 'Ajustado' : 'Abierto'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-neutral-300 mt-1">{a.storeName}</div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2 font-mono">
                    <span>{new Date(a.startedAt).toLocaleDateString('es-CO')}</span>
                    {hasDiff && <span className="text-amber-400 font-bold">⚠️ Con diferencias</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Active Audit Worksheet */}
        <div className="lg:col-span-3 space-y-4">
          {activeAudit ? (
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
              {/* Active Audit Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-red-500 bg-red-600/10 px-2 py-0.5 rounded border border-red-500/20">
                      {activeAudit.code}
                    </span>
                    <span className="font-bold text-sm text-white">{activeAudit.storeName}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Auditor responsable: <strong className="text-neutral-200">{activeAudit.auditorName}</strong> · Fecha: {new Date(activeAudit.startedAt).toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Apply adjustment action */}
                <div className="flex items-center gap-2">
                  {canApplyAdjustment ? (
                    <button
                      onClick={() => setShowApplyConfirm(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20 flex items-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      Aplicar Ajuste de Saldos ({discrepanciesCount})
                    </button>
                  ) : activeAudit.adjustmentApplied ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      Ajuste formalizado y aplicado
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
                      Sin diferencias detectadas
                    </span>
                  )}
                </div>
              </div>

              {/* KPIs of discrepancies */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 font-sans block uppercase">
                    Discrepancias
                  </span>
                  <span
                    className={`text-lg font-black ${
                      discrepanciesCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {discrepanciesCount} SKUs
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 font-sans block uppercase">
                    Diferencia Neta Unidades
                  </span>
                  <span
                    className={`text-lg font-black flex items-center gap-1 ${
                      totalVarianceQty > 0
                        ? 'text-emerald-400'
                        : totalVarianceQty < 0
                        ? 'text-red-400'
                        : 'text-neutral-300'
                    }`}
                  >
                    {totalVarianceQty > 0 ? `+${totalVarianceQty}` : totalVarianceQty} unids.
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 font-sans block uppercase">
                    Impacto Financiero Costo
                  </span>
                  <span
                    className={`text-base font-black ${
                      totalVarianceCost >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCOP(totalVarianceCost)}
                  </span>
                </div>
              </div>

              {/* Items worksheet table */}
              <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950 text-[10px] uppercase font-bold text-neutral-500">
                      <th className="py-2.5 px-3">Prenda & SKU</th>
                      <th className="py-2.5 px-3">Talla / Color</th>
                      <th className="py-2.5 px-3 text-center">Cant. Sistema</th>
                      <th className="py-2.5 px-3 text-center">Cant. Física Contada</th>
                      <th className="py-2.5 px-3 text-center">Diferencia (+/-)</th>
                      <th className="py-2.5 px-3 text-right">Valor Descuadre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono">
                    {activeAudit.items.map((item) => {
                      const hasDiscrepancy = item.variance !== 0;

                      return (
                        <tr
                          key={item.sku}
                          className={`transition ${
                            hasDiscrepancy ? 'bg-amber-950/20' : 'hover:bg-neutral-950/60'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-sans">
                            <span className="font-bold text-white block">{item.productName}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{item.sku}</span>
                          </td>

                          <td className="py-2.5 px-3 font-sans">
                            <span className="font-semibold text-neutral-200">Talla {item.size}</span>
                            <span className="text-[10px] text-neutral-400 block">{item.color}</span>
                          </td>

                          <td className="py-2.5 px-3 text-center font-bold text-neutral-300">
                            {item.systemQty}
                          </td>

                          <td className="py-2.5 px-3 text-center font-sans">
                            {activeAudit.adjustmentApplied ? (
                              <span className="font-bold font-mono text-white text-sm">
                                {item.countedQty}
                              </span>
                            ) : (
                              <div className="inline-flex items-center border border-neutral-700 rounded-lg overflow-hidden bg-black">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateItemCounted(item.sku, item.countedQty - 1)
                                  }
                                  className="px-2 py-0.5 text-neutral-400 hover:text-white"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.countedQty}
                                  onChange={(e) =>
                                    handleUpdateItemCounted(item.sku, Number(e.target.value))
                                  }
                                  className="w-12 text-center font-mono font-bold text-white bg-transparent focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateItemCounted(item.sku, item.countedQty + 1)
                                  }
                                  className="px-2 py-0.5 text-neutral-400 hover:text-white"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            {item.variance === 0 ? (
                              <span className="text-neutral-500 font-bold">0 (Cuadrado)</span>
                            ) : item.variance > 0 ? (
                              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                +{item.variance} (Sobrante)
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                                {item.variance} (Faltante)
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`font-bold ${
                                item.totalVarianceValue > 0
                                  ? 'text-emerald-400'
                                  : item.totalVarianceValue < 0
                                  ? 'text-red-400'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {formatCOP(item.totalVarianceValue)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {activeAudit.adjustmentApplied && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-1">
                  <span className="text-neutral-400 font-semibold block">
                    Motivo formal registrado por supervisor:
                  </span>
                  <p className="text-neutral-200 italic">&quot;{activeAudit.adjustmentReason}&quot;</p>
                  <span className="text-[10px] text-neutral-500 font-mono block">
                    Firma: {activeAudit.supervisorName} · Completado el{' '}
                    {new Date(activeAudit.completedAt!).toLocaleString('es-CO')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl">
              <p className="text-xs text-neutral-500">Selecciona o crea una sesión de conteo.</p>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM APPLY ADJUSTMENT MODAL (Restricted by Role) */}
      {showApplyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Autorización Formal de Ajuste de Saldos</span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Esta operación actualizará automáticamente las existencias del sistema para igualarlas con el conteo físico realizado en <strong className="text-white">{activeAudit?.storeName}</strong>. Se crearán movimientos inmutables de auditoría bajo tu firma de usuario (<strong>{currentUser.name}</strong>).
            </p>

            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-neutral-200">
                Motivo y Justificación del Ajuste (Requerido) *
              </label>
              <textarea
                rows={3}
                required
                value={adjustmentReasonText}
                onChange={(e) => setAdjustmentReasonText(e.target.value)}
                placeholder="Ej: Cierre de mes, cuadre por devolución física no ingresada oportunamente, o faltante por merma verificada."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowApplyConfirm(false)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustmentSubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20"
              >
                Confirmar & Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW AUDIT MODAL */}
      {showNewAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-red-500" />
              Iniciar Nuevo Conteo Físico
            </h3>
            <p className="text-xs text-neutral-400">
              Selecciona el punto de venta donde se realizará la verificación física de inventario:
            </p>

            <div className="space-y-2">
              {allStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStartNewCount(store.id)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 hover:border-red-500 rounded-xl text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-red-400 transition">
                      {store.name}
                    </div>
                    <div className="text-[10px] text-neutral-500">{store.municipality}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowNewAuditModal(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
