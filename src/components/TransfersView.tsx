import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Plus,
  AlertCircle,
  Building2,
  Check,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import {
  TransferRequest,
  Store,
  Product,
  StoreInventoryItem,
  User,
  TransferStatus
} from '../types/inventory';
import { formatCode7Display } from '../utils/code7';

interface TransfersViewProps {
  currentStore: Store;
  allStores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  transfers: TransferRequest[];
  currentUser: User;
  onCreateTransfer: (params: {
    fromStoreId: string;
    toStoreId: string;
    items: Array<{ sku: string; quantity: number }>;
    user: User;
    notes?: string;
  }) => { success: boolean; error?: string };
  onApproveTransfer: (transferId: string, user: User) => { success: boolean; error?: string };
  onReceiveTransfer: (transferId: string, user: User) => { success: boolean; error?: string };
  onRejectTransfer: (transferId: string, user: User, reason: string) => { success: boolean; error?: string };
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  currentStore,
  allStores,
  products,
  inventory,
  transfers,
  currentUser,
  onCreateTransfer,
  onApproveTransfer,
  onReceiveTransfer,
  onRejectTransfer
}) => {
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [rejectionModalTransferId, setRejectionModalTransferId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // New transfer form state
  const [fromStoreId, setFromStoreId] = useState<string>(
    allStores.find((s) => s.id !== currentStore.id)?.id || ''
  );
  const [toStoreId, setToStoreId] = useState<string>(currentStore.id);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedSku, setSelectedSku] = useState<string>(products[0]?.variants[0]?.sku || '');
  const [transferQty, setTransferQty] = useState<number>(2);
  const [transferNotes, setTransferNotes] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedProd = products.find((p) => p.id === selectedProductId) || products[0];

  // Stock available at origin store for the selected SKU
  const availableOriginStock =
    inventory.find((i) => i.storeId === fromStoreId && i.sku === selectedSku)?.quantity || 0;

  // Handle Create Transfer
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const res = onCreateTransfer({
      fromStoreId,
      toStoreId,
      items: [{ sku: selectedSku, quantity: transferQty }],
      user: currentUser,
      notes: transferNotes || 'Solicitud de reposición entre tiendas.'
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: '¡Solicitud de transferencia generada exitosamente y notificada a la tienda origen!'
      });
      setShowNewTransferModal(false);
      setTransferNotes('');
    } else {
      setNotification({ type: 'error', message: res.error || 'Error al solicitar transferencia.' });
    }
  };

  // One-click demo test scenario from Page 4:
  // "Bello: 4 camisas disponibles. El Tesoro: 0 unidades. El Tesoro solicita 2 unidades. Bello acepta."
  const handleRunDocumentScenario = () => {
    const bello = allStores.find((s) => s.id === 'store-fabricato');
    const tesoro = allStores.find((s) => s.id === 'store-tesoro');
    const skullCamiseta = products.find((p) => p.code7 === '3103015');

    if (!bello || !tesoro || !skullCamiseta) return;

    const sku = '3103015-3-6M-NEG';

    const res = onCreateTransfer({
      fromStoreId: bello.id,
      toStoreId: tesoro.id,
      items: [{ sku, quantity: 2 }],
      user: currentUser,
      notes: 'Demostración oficial según Sección 12 del requerimiento (Bello ➔ El Tesoro, 2 camisas).'
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: 'Demostración de requerimiento creada: El Tesoro solicita 2 camisas a Parque Fabricato (Bello).'
      });
    } else {
      setNotification({ type: 'error', message: res.error || 'Error al iniciar escenario de prueba.' });
    }
  };

  const statusBadges: Record<TransferStatus, { label: string; color: string; icon: React.ReactNode }> = {
    SOLICITADA: {
      label: 'Pendiente Aprobación',
      color: 'bg-amber-950/70 border-amber-700 text-amber-300',
      icon: <Clock className="w-3 h-3 text-amber-400" />
    },
    APROBADA: {
      label: 'Aprobada',
      color: 'bg-blue-950/70 border-blue-700 text-blue-300',
      icon: <CheckCircle className="w-3 h-3 text-blue-400" />
    },
    EN_TRANSITO: {
      label: 'En Tránsito (Despachada)',
      color: 'bg-purple-950/70 border-purple-700 text-purple-300',
      icon: <Truck className="w-3 h-3 text-purple-400" />
    },
    RECIBIDA: {
      label: 'Recibida en Destino',
      color: 'bg-emerald-950/70 border-emerald-700 text-emerald-300',
      icon: <Check className="w-3 h-3 text-emerald-400" />
    },
    RECHAZADA: {
      label: 'Rechazada',
      color: 'bg-red-950/70 border-red-700 text-red-300',
      icon: <X className="w-3 h-3 text-red-400" />
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Movimientos Inter-Tienda (Valle de Aburrá)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Transferencias de Mercancía Entre Tiendas
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Flujo formal de solicitud, aprobación de origen, despacho y recepción en destino
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunDocumentScenario}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition"
            title="Crea automáticamente la solicitud descrita en la página 4 del documento"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular Caso PDF (Bello ➔ Tesoro)</span>
          </button>

          <button
            onClick={() => setShowNewTransferModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Solicitud</span>
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
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Info Card explaining formal workflow (Section 12) */}
      <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex items-start gap-3 text-xs text-neutral-300">
        <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-bold">
            Regla de Negocio Sección 12: Descuento & Acreditación Automatizada
          </strong>
          <p className="text-neutral-400 leading-relaxed">
            Al aceptar y despachar una transferencia, el sistema descuenta automáticamente las unidades de la tienda origen y las traslada a estado en tránsito. Cuando la tienda destino confirma la recepción, se acreditan al saldo disponible. El sistema bloquea transferencias mayores a las existencias físicas disponibles.
          </p>
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {transfers.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl space-y-2">
            <ArrowRightLeft className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-300">No hay transferencias registradas</h3>
            <p className="text-xs text-neutral-500">
              Genera una nueva solicitud de reposición usando el botón superior.
            </p>
          </div>
        ) : (
          transfers.map((trf) => {
            const badge = statusBadges[trf.status];

            // Permissions to act on this transfer:
            const canApprove =
              (currentUser.role === 'admin_general' ||
                (currentUser.role === 'admin_tienda' && currentUser.storeId === trf.fromStoreId)) &&
              trf.status === 'SOLICITADA';

            const canReceive =
              (currentUser.role === 'admin_general' ||
                (currentUser.role === 'admin_tienda' && currentUser.storeId === trf.toStoreId) ||
                (currentUser.role === 'empleado_operativo' && currentUser.storeId === trf.toStoreId)) &&
              (trf.status === 'EN_TRANSITO' || trf.status === 'APROBADA');

            return (
              <div
                key={trf.id}
                className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-neutral-200">{trf.code}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-500 font-mono">
                    Solicitada: {new Date(trf.requestedAt).toLocaleString('es-CO')}
                  </span>
                </div>

                {/* Origin ➔ Destination Route Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">
                      Tienda Origen (Despacha):
                    </span>
                    <div className="font-bold text-white flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{trf.fromStoreName}</span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-neutral-800 sm:pl-3">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">
                      Tienda Destino (Solicita & Recibe):
                    </span>
                    <div className="font-bold text-emerald-400 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{trf.toStoreName}</span>
                    </div>
                  </div>
                </div>

                {/* Items in Transfer */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-neutral-400">
                    Prendas Solicitadas:
                  </span>
                  <div className="divide-y divide-neutral-800 bg-neutral-950/60 border border-neutral-800 rounded-xl overflow-hidden text-xs">
                    {trf.items.map((item) => (
                      <div
                        key={item.sku}
                        className="p-3 flex items-center justify-between gap-3 font-mono"
                      >
                        <div className="truncate">
                          <span className="font-bold text-white font-sans block truncate">
                            {item.productName}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {item.sku} · Talla: <strong>{item.size}</strong> · Color: {item.color}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-white font-mono">
                            {item.quantity} unids.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traceability Details & Notes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
                  <div className="space-y-0.5">
                    <div className="text-[11px]">
                      Solicitó: <strong className="text-neutral-300">{trf.requestedBy.name}</strong>
                    </div>
                    {trf.respondedBy && (
                      <div className="text-[11px]">
                        Aprobó/Respondió: <strong className="text-neutral-300">{trf.respondedBy.name}</strong> ({new Date(trf.respondedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    )}
                    {trf.receivedBy && (
                      <div className="text-[11px]">
                        Recibió en destino: <strong className="text-emerald-400">{trf.receivedBy.name}</strong> ({new Date(trf.receivedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    )}
                    {trf.notes && (
                      <p className="text-[11px] text-neutral-500 italic mt-1">&quot;{trf.notes}&quot;</p>
                    )}
                    {trf.rejectionReason && (
                      <p className="text-[11px] text-red-400 font-semibold mt-1">
                        Motivo rechazo: {trf.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {canApprove && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const res = onApproveTransfer(trf.id, currentUser);
                            if (res.success) {
                              setNotification({
                                type: 'success',
                                message: `Transferencia ${trf.code} aprobada y despachada. Unidades descontadas de origen.`
                              });
                            } else {
                              setNotification({ type: 'error', message: res.error || 'Error al aprobar.' });
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Aprobar & Despachar
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectionModalTransferId(trf.id);
                            setRejectionReasonText('');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-red-950/60 text-red-400 border border-neutral-700 hover:border-red-700 font-semibold rounded-xl text-xs transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      </>
                    )}

                    {canReceive && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = onReceiveTransfer(trf.id, currentUser);
                          if (res.success) {
                            setNotification({
                              type: 'success',
                              message: `¡Mercancía recibida conforme! Las unidades han sido acreditadas a ${trf.toStoreName}.`
                            });
                          } else {
                            setNotification({ type: 'error', message: res.error || 'Error al recibir.' });
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar Recepción en {trf.toStoreName}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW TRANSFER MODAL */}
      {showNewTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-red-500" />
                Nueva Solicitud de Traslado
              </h3>
              <button
                onClick={() => setShowNewTransferModal(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Tienda Origen (Enviar desde):
                  </label>
                  <select
                    value={fromStoreId}
                    onChange={(e) => setFromStoreId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-2 text-neutral-100 focus:outline-none"
                  >
                    {allStores.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.id === toStoreId}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Tienda Destino (Recibir en):
                  </label>
                  <select
                    value={toStoreId}
                    onChange={(e) => setToStoreId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-2 text-neutral-100 focus:outline-none"
                  >
                    {allStores.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.id === fromStoreId}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Prenda / Referencia</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod && prod.variants[0]) {
                      setSelectedSku(prod.variants[0].sku);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code7} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Talla & Color (SKU)</label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none"
                >
                  {selectedProd?.variants.map((v) => (
                    <option key={v.sku} value={v.sku}>
                      Talla {v.size} ({v.color}) - SKU: {v.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">
                    Stock disponible en Tienda Origen:
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      availableOriginStock > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {availableOriginStock} unidades disponibles
                  </span>
                </div>

                <div className="text-right">
                  <label className="text-[10px] text-neutral-400 block font-semibold">
                    Cantidad a solicitar:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={availableOriginStock > 0 ? availableOriginStock : 99}
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-20 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Motivo / Justificación
                </label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Ej: Cliente esperando en mostrador, reposición fin de semana, etc."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTransferModal(false)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={availableOriginStock < transferQty}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl transition"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalTransferId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Rechazar Solicitud de Traslado
            </h3>
            <p className="text-xs text-neutral-400">
              Indica la razón por la cual no es posible realizar el despacho desde esta tienda.
            </p>

            <textarea
              rows={3}
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="Ej: Stock reservado para cliente local / Daño detectado en prenda / Bajo margen de existencias."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalTransferId(null)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  onRejectTransfer(rejectionModalTransferId, currentUser, rejectionReasonText);
                  setRejectionModalTransferId(null);
                  setNotification({
                    type: 'success',
                    message: 'Solicitud rechazada con motivo registrado en auditoría.'
                  });
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
