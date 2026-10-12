import { PRODUCT_GROUPS, GARMENT_TYPES } from '../types/inventory';

export interface ParsedCode7 {
  isValid: boolean;
  code: string;
  groupCode: string;
  groupName: string;
  typeCode: string;
  typeName: string;
  modelNumber: string;
  consecutive: string;
  error?: string;
}

export function parseAndValidateCode7(rawCode: string): ParsedCode7 {
  const code = rawCode.trim();

  if (!/^\d{7}$/.test(code)) {
    return {
      isValid: false,
      code,
      groupCode: '',
      groupName: '',
      typeCode: '',
      typeName: '',
      modelNumber: '',
      consecutive: '',
      error: 'El código debe tener exactamente 7 dígitos numéricos (GG TT MM C).'
    };
  }

  const groupCode = code.slice(0, 2);
  const typeCode = code.slice(2, 4);
  const modelNumber = code.slice(4, 6);
  const consecutive = code.slice(6, 7);

  const group = PRODUCT_GROUPS[groupCode];
  if (!group) {
    return {
      isValid: false,
      code,
      groupCode,
      groupName: 'Grupo Desconocido',
      typeCode,
      typeName: '',
      modelNumber,
      consecutive,
      error: `El prefijo de grupo "${groupCode}" no es válido. Debe ser 31, 32, 33, 41, 42, 51 o 52.`
    };
  }

  const garment = GARMENT_TYPES[typeCode];
  if (!garment) {
    return {
      isValid: false,
      code,
      groupCode,
      groupName: group.name,
      typeCode,
      typeName: 'Tipo Desconocido',
      modelNumber,
      consecutive,
      error: `El tipo de prenda "${typeCode}" no es válido. Debe estar entre 01 y 12.`
    };
  }

  return {
    isValid: true,
    code,
    groupCode,
    groupName: group.name,
    typeCode,
    typeName: garment.name,
    modelNumber,
    consecutive
  };
}

/**
 * Builds a 7-digit code from parts
 */
export function buildCode7(groupCode: string, typeCode: string, modelNumber: number | string, consecutive: number | string): string {
  const g = String(groupCode).padStart(2, '0');
  const t = String(typeCode).padStart(2, '0');
  const m = String(modelNumber).padStart(2, '0');
  const c = String(consecutive).slice(-1);
  return `${g}${t}${m}${c}`;
}

/**
 * Formats 7-digit code visually as GG-TT-MM-C for display readability
 */
export function formatCode7Display(code: string): string {
  if (code.length === 7) {
    return `${code.slice(0, 2)}·${code.slice(2, 4)}·${code.slice(4, 6)}·${code.slice(6, 7)}`;
  }
  return code;
}

/**
 * Format currency in Colombian Pesos ($ COP)
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}
