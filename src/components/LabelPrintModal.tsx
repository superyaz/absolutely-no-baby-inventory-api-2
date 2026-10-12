import React, { useState } from 'react';
import { Printer, X, Sliders, CheckSquare, Layers, Sparkles } from 'lucide-react';
import { Product, ProductVariant, PrintSettings, PrintDeviceFormat, Store } from '../types/inventory';
import { BarcodeRenderer } from './BarcodeRenderer';
import { BrandLogo } from './BrandLogo';
import { formatCOP, formatCode7Display } from '../utils/code7';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentStore: Store;
  initialProduct?: Product | null;
  initialVariant?: ProductVariant | null;
}

interface PrintableLabelItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  copies: number;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
  isOpen,
  onClose,
  products,
  currentStore,
  initialProduct,
  initialVariant
}) => {
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    format: 'thermal_80',
    showPrice: true,
    showBarcode: true,
    showLogo: true,
    showStoreName: true,
    copiesPerItem: 1
  });

  // Selected items queue to print
  const [selectedItems, setSelectedItems] = useState<PrintableLabelItem[]>(() => {
    if (initialProduct && initialVariant) {
      return [{
        id: `${initialProduct.id}-${initialVariant.sku}`,
        product: initialProduct,
        variant: initialVariant,
        copies: 1
      }];
    }
    if (initialProduct) {
      return initialProduct.variants.map((v) => ({
        id: `${initialProduct.id}-${v.sku}`,
        product: initialProduct,
        variant: v,
        copies: 1
      }));
    }
    // Default to first product if nothing selected
    const first = products[0];
    if (!first) return [];
    return first.variants.slice(0, 3).map((v) => ({
      id: `${first.id}-${v.sku}`,
      product: first,
      variant: v,
      copies: 1
    }));
  });

  const [activeTab, setActiveTab] = useState<'preview' | 'batch_select' | 'settings'>('preview');

  if (!isOpen) return null;

  const totalLabelsCount = selectedItems.reduce((acc, curr) => acc + curr.copies, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleSelectAllProductVariants = (prod: Product) => {
    const newItems: PrintableLabelItem[] = prod.variants.map((v) => ({
      id: `${prod.id}-${v.sku}`,
      product: prod,
      variant: v,
      copies: printSettings.copiesPerItem
    }));

    // merge without duplicates
    setSelectedItems((prev) => {
      const filtered = prev.filter((item) => item.product.id !== prod.id);
      return [...filtered, ...newItems];
    });
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCopies = (id: string, newCopies: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, copies: Math.max(1, newCopies) } : item))
    );
  };

  return (
    <>
      {/* Interactive Modal (hidden during print) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm no-print">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  Impresión de Etiquetas de Prendas
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {totalLabelsCount} etiquetas en cola
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Formato configurable para impresoras térmicas (58mm/80mm) y hojas A4
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={selectedItems.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20"
              >
                <Printer className="w-4 h-4" />
                Imprimir Ahora ({totalLabelsCount})
              </button>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-neutral-800 px-4 bg-neutral-950/40 text-xs font-semibold text-neutral-400">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'border-red-500 text-white'
                  : 'border-transparent hover:text-neutral-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Vista Previa de Etiquetas
            </button>
            <button
              onClick={() => setActiveTab('batch_select')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'batch_select'
                  ? 'border-red-500 text-white'
                  : 'border-transparent hover:text-neutral-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Selección por Lote ({selectedItems.length} prendas)
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-red-500 text-white'
                  : 'border-transparent hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Configuración de Dispositivo
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'preview' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-neutral-400">
                    Formato actual: <span className="font-bold text-neutral-200 uppercase">{printSettings.format.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Las etiquetas se ajustan automáticamente a la calibración de tu impresora.
                  </div>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500">
                    No has seleccionado ninguna prenda para imprimir. Ve a la pestaña &quot;Selección por Lote&quot;.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white text-black p-3.5 rounded-lg border-2 border-dashed border-neutral-400 shadow-sm relative flex flex-col items-center justify-between text-center min-h-[220px]"
                      >
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-300">
                            x{item.copies}
                          </span>
                        </div>

                        {/* Top: Logo & Store */}
                        <div className="w-full pb-1 border-b border-neutral-200 flex flex-col items-center">
                          {printSettings.showLogo && (
                            <BrandLogo size="sm" showText={true} className="mb-0.5 scale-90" />
                          )}
                          {printSettings.showStoreName && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                              {currentStore.name}
                            </span>
                          )}
                        </div>

                        {/* Product Name & 7-digit code */}
                        <div className="my-1.5">
                          <div className="font-extrabold text-xs uppercase tracking-tight text-neutral-900 leading-tight">
                            {item.product.name}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-700 font-semibold mt-0.5">
                            Cód: {formatCode7Display(item.product.code7)}
                          </div>
                        </div>

                        {/* Barcode SVG */}
                        {printSettings.showBarcode && (
                          <div className="w-full flex justify-center py-1">
                            <BarcodeRenderer
                              value={item.variant.barcode || item.variant.sku}
                              width={1.2}
                              height={34}
                              fontSize={9}
                              displayValue={true}
                              lineColor="#000000"
                              background="#ffffff"
                            />
                          </div>
                        )}

                        {/* Bottom: Size, Color & Price */}
                        <div className="w-full pt-1.5 border-t border-neutral-200 flex items-center justify-between text-left">
                          <div>
                            <span className="text-[9px] uppercase text-neutral-500 block">Talla / Color</span>
                            <span className="text-xs font-black font-mono text-black">
                              {item.variant.size} · {item.variant.color.split(' ')[0]}
                            </span>
                          </div>

                          {printSettings.showPrice && (
                            <div className="text-right">
                              <span className="text-[9px] uppercase text-neutral-500 block">Precio</span>
                              <span className="text-xs font-black text-black font-mono">
                                {formatCOP(item.product.price)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'batch_select' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Catálogo de Productos para Etiquetado
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      // Select all variants of all products
                      const all: PrintableLabelItem[] = [];
                      products.forEach((p) => {
                        p.variants.forEach((v) => {
                          all.push({
                            id: `${p.id}-${v.sku}`,
                            product: p,
                            variant: v,
                            copies: 1
                          });
                        });
                      });
                      setSelectedItems(all);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Seleccionar Todo el Inventario
                  </button>
                </div>

                <div className="space-y-3">
                  {products.map((prod) => {
                    const isFullySelected = prod.variants.every((v) =>
                      selectedItems.some((i) => i.id === `${prod.id}-${v.sku}`)
                    );

                    return (
                      <div
                        key={prod.id}
                        className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 mr-2">
                              {prod.code7}
                            </span>
                            <span className="text-sm font-bold text-white">{prod.name}</span>
                            <span className="text-xs text-neutral-400 ml-2">
                              ({prod.variants.length} variantes por talla/color)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectAllProductVariants(prod)}
                            className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
                          >
                            {isFullySelected ? 'Re-añadir todas' : '+ Añadir todas las tallas'}
                          </button>
                        </div>

                        {/* Variant Chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {prod.variants.map((variant) => {
                            const itemId = `${prod.id}-${variant.sku}`;
                            const isSelected = selectedItems.find((i) => i.id === itemId);

                            return (
                              <div
                                key={variant.sku}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-2 transition ${
                                  isSelected
                                    ? 'bg-red-950/40 border-red-700 text-red-200'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      handleRemoveItem(itemId);
                                    } else {
                                      setSelectedItems((prev) => [
                                        ...prev,
                                        {
                                          id: itemId,
                                          product: prod,
                                          variant,
                                          copies: 1
                                        }
                                      ]);
                                    }
                                  }}
                                  className="font-medium"
                                >
                                  {variant.size} - {variant.color.split(' ')[0]}
                                </button>

                                {isSelected && (
                                  <div className="flex items-center border border-red-800/80 rounded bg-black/40 px-1">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCopies(itemId, isSelected.copies - 1)}
                                      className="px-1 text-red-300 hover:text-white"
                                    >
                                      -
                                    </button>
                                    <span className="px-1 font-mono font-bold text-[11px] text-white">
                                      {isSelected.copies}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCopies(itemId, isSelected.copies + 1)}
                                      className="px-1 text-red-300 hover:text-white"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    Formato de Salida / Dispositivo
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'thermal_58', name: 'Térmica 58 mm', desc: 'Rollos portátiles POS' },
                      { id: 'thermal_80', name: 'Térmica 80 mm', desc: 'Estándar tiendas retail' },
                      { id: 'sheet_a4', name: 'Hoja Carta / A4', desc: 'Cuadrícula 24 adhesivos' }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          setPrintSettings((s) => ({ ...s, format: fmt.id as PrintDeviceFormat }))
                        }
                        className={`p-3 rounded-xl border text-left transition ${
                          printSettings.format === fmt.id
                            ? 'bg-red-950/40 border-red-600 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{fmt.name}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{fmt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Campos visibles en la etiqueta
                  </h4>

                  <label className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer">
                    <span className="text-xs text-neutral-200">Mostrar Emblema y Logo Absolutely No Baby</span>
                    <input
                      type="checkbox"
                      checked={printSettings.showLogo}
                      onChange={(e) => setPrintSettings((s) => ({ ...s, showLogo: e.target.checked }))}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer">
                    <span className="text-xs text-neutral-200">Mostrar Código de Barras (Code 128)</span>
                    <input
                      type="checkbox"
                      checked={printSettings.showBarcode}
                      onChange={(e) => setPrintSettings((s) => ({ ...s, showBarcode: e.target.checked }))}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer">
                    <span className="text-xs text-neutral-200">Mostrar Precio de Venta ($ COP)</span>
                    <input
                      type="checkbox"
                      checked={printSettings.showPrice}
                      onChange={(e) => setPrintSettings((s) => ({ ...s, showPrice: e.target.checked }))}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer">
                    <span className="text-xs text-neutral-200">Mostrar Nombre de Tienda o Sucursal</span>
                    <input
                      type="checkbox"
                      checked={printSettings.showStoreName}
                      onChange={(e) => setPrintSettings((s) => ({ ...s, showStoreName: e.target.checked }))}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400">
              Total etiquetas a imprimir: <strong className="text-white">{totalLabelsCount}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY CONTAINER (active when window.print() is executed) */}
      <div className="print-only hidden">
        <div
          className={
            printSettings.format === 'thermal_58'
              ? 'w-[54mm] p-1 font-sans text-black text-center'
              : printSettings.format === 'thermal_80'
              ? 'w-[76mm] p-2 font-sans text-black text-center'
              : 'grid grid-cols-3 gap-4 p-6 font-sans text-black'
          }
        >
          {selectedItems.map((item) =>
            Array.from({ length: item.copies }).map((_, copyIndex) => (
              <div
                key={`${item.id}-print-${copyIndex}`}
                className="border border-neutral-400 p-2 mb-2 flex flex-col items-center justify-between text-center bg-white page-break-after"
                style={{ pageBreakInside: 'avoid' }}
              >
                {printSettings.showLogo && (
                  <div className="mb-1">
                    <BrandLogo size="sm" showText={true} />
                  </div>
                )}

                {printSettings.showStoreName && (
                  <div className="text-[10px] font-bold uppercase">{currentStore.name}</div>
                )}

                <div className="font-extrabold text-xs uppercase my-0.5 leading-tight">
                  {item.product.name}
                </div>

                <div className="text-[10px] font-mono font-bold">
                  {formatCode7Display(item.product.code7)}
                </div>

                {printSettings.showBarcode && (
                  <div className="my-1">
                    <BarcodeRenderer
                      value={item.variant.barcode || item.variant.sku}
                      width={1.2}
                      height={32}
                      fontSize={9}
                      displayValue={true}
                    />
                  </div>
                )}

                <div className="w-full flex justify-between items-center text-[10px] font-bold border-t border-black pt-1">
                  <span>Talla: {item.variant.size}</span>
                  {printSettings.showPrice && <span>{formatCOP(item.product.price)}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
