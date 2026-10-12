import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, RefreshCw, Volume2, Search, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';
import { Product, StoreInventoryItem, Store } from '../types/inventory';
import { formatCOP, formatCode7Display } from '../utils/code7';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  inventory: StoreInventoryItem[];
  currentStore: Store;
  onSelectProduct?: (product: Product, sku?: string) => void;
  onQuickInbound?: (product: Product, sku: string, qty: number) => void;
  onQuickOutbound?: (product: Product, sku: string, qty: number) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  inventory,
  currentStore,
  onSelectProduct,
  onQuickInbound,
  onQuickOutbound
}) => {
  const [manualInput, setManualInput] = useState('');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [quickQty, setQuickQty] = useState(1);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-barcode-scanner';

  // Sound beep on successful barcode scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1.2 kHz crisp POS beep
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    playBeep();
    setScannedCode(decodedText.trim());
    setManualInput(decodedText.trim());
  };

  // Keyboard wedge listener (for physical USB/Bluetooth laser barcode scanners)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in a form input, let them type
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Enter') {
          handleScanSuccess((target as HTMLInputElement).value);
        }
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          handleScanSuccess(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Start / Stop Camera Scanner
  useEffect(() => {
    if (!isOpen) {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          html5QrCodeRef.current = null;
        });
      }
      setIsScanning(false);
      return;
    }

    const startScanner = async () => {
      try {
        setCameraError(null);
        // Small delay to ensure DOM element is mounted
        await new Promise((r) => setTimeout(r, 200));

        const container = document.getElementById(scannerContainerId);
        if (!container) return;

        const scanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });

        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 }
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // scan frame error (expected between frames)
          }
        );

        setIsScanning(true);
      } catch (err: unknown) {
        console.warn('Camera initiation notice:', err);
        setCameraError('Cámara no disponible o permisos denegados. Puedes usar el lector láser o ingresar el código manualmente.');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          html5QrCodeRef.current = null;
        });
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Search matched product or SKU
  const matchedProduct = scannedCode
    ? products.find((p) => {
        // match 7-digit code
        if (p.code7 === scannedCode) return true;
        // match any variant SKU or Barcode
        return p.variants.some((v) => v.barcode === scannedCode || v.sku === scannedCode);
      })
    : null;

  const matchedVariant = matchedProduct && scannedCode
    ? matchedProduct.variants.find((v) => v.barcode === scannedCode || v.sku === scannedCode) || matchedProduct.variants[0]
    : matchedProduct?.variants[0];

  const currentStoreStock = matchedVariant
    ? inventory.find((i) => i.storeId === currentStore.id && i.sku === matchedVariant.sku)?.quantity || 0
    : 0;

  // Total stock across all stores
  const allStoresStock = matchedVariant
    ? inventory.filter((i) => i.sku === matchedVariant.sku).reduce((acc, curr) => acc + curr.quantity, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Lector de Código de Barras
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {currentStore.name}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Escanea con cámara, lector de pistola USB o teclado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {notification && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                notification.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/60 border border-red-800 text-red-300'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {notification.message}
            </div>
          )}

          {/* Camera Viewport */}
          <div className="relative rounded-xl overflow-hidden bg-black border border-neutral-800 min-h-[200px] flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full min-h-[200px]" />
            
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/90 text-neutral-400">
                <Camera className="w-10 h-10 mb-2 text-neutral-600" />
                <p className="text-sm font-medium text-neutral-300">Modo Lector Activo</p>
                <p className="text-xs text-neutral-500 max-w-xs mt-1">
                  {cameraError || 'Apunta la cámara a la etiqueta o usa una pistola lectora conectada por USB.'}
                </p>
              </div>
            )}

            {/* Target Reticle Indicator */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-red-500/80 rounded-lg relative shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Manual Input / Barcode Gun field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Ingreso Rápido de Código o Barcode:</span>
              <span className="text-[11px] text-neutral-500">Ej: 3103015 o 3103015-0-3M-NEG</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Escanea o escribe código de 7 dígitos / SKU..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualInput.trim()) {
                      handleScanSuccess(manualInput.trim());
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (manualInput.trim()) {
                    handleScanSuccess(manualInput.trim());
                  }
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-xl border border-neutral-700 transition"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Scanned Result Card */}
          {scannedCode && (
            <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/70 space-y-3">
              {matchedProduct ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-red-600/10 text-red-500 border border-red-500/20 rounded">
                          {formatCode7Display(matchedProduct.code7)}
                        </span>
                        {matchedVariant && (
                          <span className="text-xs font-mono text-neutral-400">
                            SKU: {matchedVariant.sku}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{matchedProduct.name}</h3>
                      <p className="text-xs text-neutral-400">
                        {matchedProduct.description} · Colección: <span className="text-neutral-300">{matchedProduct.seasonName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400 font-mono">
                        {formatCOP(matchedProduct.price)}
                      </div>
                      <span className="text-[10px] text-neutral-500 uppercase">Precio Venta</span>
                    </div>
                  </div>

                  {/* Variant & Store Availability */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase">Talla</span>
                      <span className="font-bold text-neutral-200">{matchedVariant?.size || 'Todas'}</span>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase">Color</span>
                      <span className="font-bold text-neutral-200">{matchedVariant?.color || 'Todos'}</span>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase">Stock en esta tienda</span>
                      <span className={`font-bold font-mono ${currentStoreStock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentStoreStock} unids.
                      </span>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase">Stock Red Aburrá</span>
                      <span className="font-bold font-mono text-cyan-400">{allStoresStock} unids.</span>
                    </div>
                  </div>

                  {/* Quick Action Operations */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Cantidad para acción:</span>
                      <div className="flex items-center border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900">
                        <button
                          type="button"
                          onClick={() => setQuickQty(Math.max(1, quickQty - 1))}
                          className="px-2.5 py-1 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-mono font-bold text-white min-w-[32px] text-center">
                          {quickQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickQty(quickQty + 1)}
                          className="px-2.5 py-1 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {onQuickInbound && matchedVariant && (
                        <button
                          type="button"
                          onClick={() => {
                            onQuickInbound(matchedProduct, matchedVariant.sku, quickQty);
                            setNotification({ type: 'success', message: `+${quickQty} unidades ingresadas a ${currentStore.name}` });
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Entrada (+)
                        </button>
                      )}

                      {onQuickOutbound && matchedVariant && (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentStoreStock < quickQty) {
                              setNotification({ type: 'error', message: `Stock insuficiente en ${currentStore.name} (Disponibles: ${currentStoreStock})` });
                              return;
                            }
                            onQuickOutbound(matchedProduct, matchedVariant.sku, quickQty);
                            setNotification({ type: 'success', message: `-${quickQty} unidades registradas como salida/venta` });
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Salida / Venta (-)
                        </button>
                      )}

                      {onSelectProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProduct(matchedProduct, matchedVariant?.sku);
                            onClose();
                          }}
                          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold transition"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Ver Ficha
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-semibold text-neutral-200">
                    Código &quot;{scannedCode}&quot; no encontrado
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    No existe ningún producto ni SKU registrado con este código. Verifica el código de 7 dígitos o regístralo como nuevo producto.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" /> Sonido de confirmación activo
          </span>
          <button
            onClick={() => {
              setScannedCode(null);
              setManualInput('');
              setNotification(null);
            }}
            className="text-neutral-400 hover:text-white flex items-center gap-1 text-xs"
          >
            <RefreshCw className="w-3 h-3" /> Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};
