import React, { useState, useEffect, useId } from 'react';
import { X, Check, AlertTriangle, Layers, Tag, DollarSign, Calendar, Sparkles } from 'lucide-react';
import {
  Product,
  PRODUCT_GROUPS,
  GARMENT_TYPES,
  SIZES,
  COLORS,
  Size,
  ColorOption,
  ProductVariant,
  SeasonCollection
} from '../types/inventory';
import { buildCode7, parseAndValidateCode7, formatCOP, formatCode7Display } from '../utils/code7';
import { BarcodeRenderer } from './BarcodeRenderer';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => { success: boolean; error?: string };
  initialProduct?: Product | null;
  existingProducts: Product[];
  seasons: SeasonCollection[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  existingProducts,
  seasons
}) => {
  const groupSelectId = useId();
  const typeSelectId = useId();
  const modelInputId = useId();
  const consecutiveInputId = useId();
  const productNameId = useId();
  const seasonSelectId = useId();
  const salePriceId = useId();
  const unitCostId = useId();
  const minStockAlertId = useId();
  const productDescriptionId = useId();

  // 7-digit code parts
  const [groupCode, setGroupCode] = useState<string>('31');
  const [typeCode, setTypeCode] = useState<string>('03');
  const [modelNumber, setModelNumber] = useState<string>('01');
  const [consecutive, setConsecutive] = useState<string>('1');

  // Basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seasonId, setSeasonId] = useState(seasons[0]?.id || '');
  const [price, setPrice] = useState(49900);
  const [cost, setCost] = useState(18500);
  const [minStockAlert, setMinStockAlert] = useState(3);
  const [active, setActive] = useState(true);

  // Variant selections
  const [selectedSizes, setSelectedSizes] = useState<Size[]>(['3-6M', '6-9M', '12-18M']);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([COLORS[0], COLORS[1]]); // Negro & Blanco

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setGroupCode(initialProduct.groupCode);
      setTypeCode(initialProduct.typeCode);
      setModelNumber(initialProduct.modelNumber);
      setConsecutive(initialProduct.consecutive);
      setName(initialProduct.name);
      setDescription(initialProduct.description);
      setSeasonId(initialProduct.seasonId);
      setPrice(initialProduct.price);
      setCost(initialProduct.cost);
      setMinStockAlert(initialProduct.minStockAlert);
      setActive(initialProduct.active);
      setSelectedSizes(initialProduct.availableSizes || []);
      setSelectedColors(initialProduct.availableColors || []);
    } else {
      // Default new product values
      setGroupCode('31');
      setTypeCode('03');
      setModelNumber('02');
      setConsecutive('1');
      setName('');
      setDescription('');
      setSeasonId(seasons[0]?.id || '');
      setPrice(49900);
      setCost(18500);
      setMinStockAlert(3);
      setActive(true);
      setSelectedSizes(['3-6M', '6-9M']);
      setSelectedColors([COLORS[0]]);
    }
    setErrorMessage(null);
  }, [initialProduct, seasons, isOpen]);

  if (!isOpen) return null;

  // Calculate code7
  const currentCode7 = buildCode7(groupCode, typeCode, modelNumber, consecutive);
  const validation = parseAndValidateCode7(currentCode7);

  // Check duplicate
  const duplicate = existingProducts.find(
    (p) => p.code7 === currentCode7 && p.id !== initialProduct?.id
  );

  // Suggest next consecutive if duplicate
  const handleAutoSuggestConsecutive = () => {
    const matchingPrefix = existingProducts.filter(
      (p) => p.groupCode === groupCode && p.typeCode === typeCode && p.modelNumber === modelNumber
    );
    const existingConsecutives = matchingPrefix.map((p) => parseInt(p.consecutive, 10)).filter((n) => !isNaN(n));
    const nextCons = existingConsecutives.length > 0 ? Math.max(...existingConsecutives) + 1 : 1;
    if (nextCons <= 9) {
      setConsecutive(String(nextCons));
    }
  };

  const handleToggleSize = (size: Size) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length === 1) return; // Keep at least one
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleToggleColor = (color: ColorOption) => {
    const exists = selectedColors.some((c) => c.code === color.code);
    if (exists) {
      if (selectedColors.length === 1) return; // Keep at least one
      setSelectedColors(selectedColors.filter((c) => c.code !== color.code));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Código de 7 dígitos inválido.');
      return;
    }

    if (duplicate) {
      setErrorMessage(
        `El código ${currentCode7} ya está en uso por "${duplicate.name}". Selecciona otro modelo o consecutivo.`
      );
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Ingresa el nombre de la prenda.');
      return;
    }

    if (selectedSizes.length === 0) {
      setErrorMessage('Selecciona al menos una talla.');
      return;
    }

    if (selectedColors.length === 0) {
      setErrorMessage('Selecciona al menos un color.');
      return;
    }

    // Generate variants
    const variants: ProductVariant[] = [];
    selectedColors.forEach((color, colIdx) => {
      selectedSizes.forEach((size, sizeIdx) => {
        const sku = `${currentCode7}-${size}-${color.code}`;
        const suffix = String(colIdx * 10 + sizeIdx + 1).padStart(2, '0');
        const barcode = `770${currentCode7}${suffix}`;
        variants.push({
          sku,
          barcode,
          size,
          color: color.name,
          colorCode: color.code,
          colorHex: color.hex
        });
      });
    });

    const selectedSeason = seasons.find((s) => s.id === seasonId) || seasons[0];

    const productPayload: Product = {
      id: initialProduct?.id || `prod-${currentCode7}`,
      code7: currentCode7,
      groupCode,
      typeCode,
      modelNumber: String(modelNumber).padStart(2, '0'),
      consecutive: String(consecutive).slice(-1),
      name: name.trim(),
      description: description.trim(),
      seasonId: selectedSeason.id,
      seasonName: selectedSeason.name,
      price: Number(price),
      cost: Number(cost),
      active,
      minStockAlert: Number(minStockAlert),
      availableSizes: selectedSizes,
      availableColors: selectedColors,
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants
    };

    const res = onSave(productPayload);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al guardar el producto.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                {initialProduct ? 'Editar Prenda' : 'Nueva Referencia de Prenda'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Norma 7 Dígitos (GG·TT·MM·C)
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Verifica grupo, tipo, modelo y consecutivo antes de guardar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-950/70 border border-red-800 rounded-xl text-xs font-semibold text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 7-DIGIT CODE CLASSIFIER BUILDER */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  Estructura Oficial de 7 Dígitos
                </span>
                <p className="text-[11px] text-neutral-500">
                  GG (Grupo) + TT (Tipo) + MM (Modelo) + C (Consecutivo)
                </p>
              </div>

              {/* Code display pill */}
              <div className="flex items-center gap-2">
                <div
                  className={`font-mono text-lg font-black tracking-widest px-3 py-1 rounded-xl border ${
                    duplicate
                      ? 'bg-red-950/50 border-red-600 text-red-400'
                      : 'bg-neutral-900 border-neutral-700 text-white'
                  }`}
                >
                  {formatCode7Display(currentCode7)}
                </div>
                {duplicate && (
                  <button
                    type="button"
                    onClick={handleAutoSuggestConsecutive}
                    className="text-[11px] bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 rounded-lg transition"
                  >
                    Auto-corregir C
                  </button>
                )}
              </div>
            </div>

            {duplicate && (
              <p className="text-xs text-red-400 font-medium">
                ⚠️ Código ya ocupado por &quot;{duplicate.name}&quot;. Cambia el modelo (MM) o consecutivo (C).
              </p>
            )}

            {/* Selectors for 7-digit structure */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label htmlFor={groupSelectId} className="block font-semibold text-neutral-400 mb-1">
                  1. Grupo (GG)
                </label>
                <select
                  id={groupSelectId}
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-neutral-100 font-medium focus:border-red-500 focus:outline-none"
                >
                  {Object.values(PRODUCT_GROUPS).map((grp) => (
                    <option key={grp.code} value={grp.code}>
                      {grp.code} - {grp.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  {PRODUCT_GROUPS[groupCode]?.ageRange}
                </span>
              </div>

              <div>
                <label htmlFor={typeSelectId} className="block font-semibold text-neutral-400 mb-1">
                  2. Tipo Prenda (TT)
                </label>
                <select
                  id={typeSelectId}
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-neutral-100 font-medium focus:border-red-500 focus:outline-none"
                >
                  {Object.values(GARMENT_TYPES).map((gar) => (
                    <option key={gar.code} value={gar.code}>
                      {gar.code} - {gar.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  {GARMENT_TYPES[typeCode]?.name}
                </span>
              </div>

              <div>
                <label htmlFor={modelInputId} className="block font-semibold text-neutral-400 mb-1">
                  3. Modelo (MM)
                </label>
                <input
                  id={modelInputId}
                  type="number"
                  min="1"
                  max="99"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="01"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-neutral-100 font-mono font-bold focus:border-red-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">Rango: 01 a 99</span>
              </div>

              <div>
                <label htmlFor={consecutiveInputId} className="block font-semibold text-neutral-400 mb-1">
                  4. Consecutivo (C)
                </label>
                <input
                  id={consecutiveInputId}
                  type="number"
                  min="1"
                  max="9"
                  value={consecutive}
                  onChange={(e) => setConsecutive(e.target.value)}
                  placeholder="1"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-neutral-100 font-mono font-bold focus:border-red-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">Dígito único: 1 a 9</span>
              </div>
            </div>
          </div>

          {/* BASIC PRODUCT INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor={productNameId} className="block text-xs font-semibold text-neutral-300 mb-1">
                Nombre de la Prenda *
              </label>
              <input
                id={productNameId}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Camiseta Born Free Skull Rebelde"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor={seasonSelectId} className="block text-xs font-semibold text-neutral-300 mb-1">
                Temporada / Colección
              </label>
              <select
                id={seasonSelectId}
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:border-red-500 focus:outline-none"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={salePriceId} className="block text-xs font-semibold text-neutral-300 mb-1">
                Precio de Venta ($ COP) *
              </label>
              <input
                id={salePriceId}
                type="number"
                min="1000"
                step="500"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 font-mono font-bold focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor={unitCostId} className="block text-xs font-semibold text-neutral-300 mb-1">
                Costo Unitario Producción ($ COP)
              </label>
              <input
                id={unitCostId}
                type="number"
                min="0"
                step="500"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor={minStockAlertId} className="block text-xs font-semibold text-neutral-300 mb-1">
                Umbral Alerta Stock Mínimo (por tienda)
              </label>
              <input
                id={minStockAlertId}
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={productDescriptionId} className="block text-xs font-semibold text-neutral-300 mb-1">
                Descripción y Composición de Tela
              </label>
              <textarea
                id={productDescriptionId}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: 100% Algodón peinado 240g, estampado serigráfico al agua, acabados reforzados."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SIZES MATRIX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                Tallas Disponibles ({selectedSizes.length} seleccionadas)
              </label>
              <span className="text-[11px] text-neutral-500">Haz clic para activar/desactivar</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleToggleSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-500 shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLORS PALETTE */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Colores Disponibles ({selectedColors.length} seleccionados)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {COLORS.map((color) => {
                const isSelected = selectedColors.some((c) => c.code === color.code);
                return (
                  <button
                    key={color.code}
                    type="button"
                    onClick={() => handleToggleColor(color)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-neutral-800 border-red-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-neutral-700 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="truncate">
                      <div className="text-[11px] font-bold truncate">{color.name}</div>
                      <div className="text-[9px] font-mono text-neutral-500">{color.code}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE BARCODE & VARIANT PREVIEW */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300">
                Variantes Generadas:{' '}
                <strong className="text-white">{selectedSizes.length * selectedColors.length} SKUs</strong>
              </span>
              <span className="text-neutral-500 font-mono">
                Muestra Barcode Code128: 770{currentCode7}01
              </span>
            </div>
            <div className="flex items-center justify-center p-2 bg-neutral-900 rounded-lg">
              <BarcodeRenderer
                value={`770${currentCode7}01`}
                width={1.4}
                height={38}
                fontSize={10}
                displayValue={true}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-red-600 w-4 h-4 rounded"
            />
            <span>Prenda Activa para Ventas y Movimientos de Inventario</span>
          </label>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!validation.isValid || !!duplicate}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {initialProduct ? 'Guardar Cambios' : 'Crear Referencia Oficial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
