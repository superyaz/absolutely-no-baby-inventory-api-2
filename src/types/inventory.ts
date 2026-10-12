/**
 * Types and Data Contracts for Absolutely No Baby Inventory Management System
 */

export interface ProductGroup {
  code: string;
  name: string;
  gender: 'masculino' | 'femenina' | 'unisex';
  ageRange: string;
}

export const PRODUCT_GROUPS: Record<string, ProductGroup> = {
  '31': { code: '31', name: 'Bebé masculino', gender: 'masculino', ageRange: '0 - 24 meses' },
  '32': { code: '32', name: 'Bebé femenina', gender: 'femenina', ageRange: '0 - 24 meses' },
  '33': { code: '33', name: 'Bebé unisex', gender: 'unisex', ageRange: '0 - 24 meses' },
  '41': { code: '41', name: 'Niño masculino', gender: 'masculino', ageRange: '2 - 8 años' },
  '42': { code: '42', name: 'Niña femenina', gender: 'femenina', ageRange: '2 - 8 años' },
  '51': { code: '51', name: 'Niño grande masculino', gender: 'masculino', ageRange: '10 - 16 años' },
  '52': { code: '52', name: 'Niña grande femenina', gender: 'femenina', ageRange: '10 - 16 años' },
};

export interface GarmentType {
  code: string;
  name: string;
}

export const GARMENT_TYPES: Record<string, GarmentType> = {
  '01': { code: '01', name: 'Body' },
  '02': { code: '02', name: 'Camisa' },
  '03': { code: '03', name: 'Camiseta' },
  '04': { code: '04', name: 'Pantalón' },
  '05': { code: '05', name: 'Short' },
  '06': { code: '06', name: 'Vestido' },
  '07': { code: '07', name: 'Falda' },
  '08': { code: '08', name: 'Chaqueta' },
  '09': { code: '09', name: 'Buzo' },
  '10': { code: '10', name: 'Pijama' },
  '11': { code: '11', name: 'Conjunto' },
  '12': { code: '12', name: 'Enterizo' },
};

export const SIZES = [
  '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M',
  '2T', '3T', '4T', '6', '8', '10', '12', '14', '16'
] as const;

export type Size = typeof SIZES[number];

export interface ColorOption {
  code: string;
  name: string;
  hex: string;
}

export const COLORS: ColorOption[] = [
  { code: 'NEG', name: 'Negro Profundo', hex: '#000000' },
  { code: 'BLA', name: 'Blanco Óptico', hex: '#FFFFFF' },
  { code: 'GOS', name: 'Gris Oscuro', hex: '#374151' },
  { code: 'GJA', name: 'Gris Jaspe Melange', hex: '#9CA3AF' },
  { code: 'ROJ', name: 'Rojo Rebelde', hex: '#DC2626' },
  { code: 'BUR', name: 'Borgoña / Tinto', hex: '#881337' },
  { code: 'AZM', name: 'Azul Marino', hex: '#1E3A8A' },
  { code: 'VOL', name: 'Verde Militar', hex: '#3F6212' },
  { code: 'CAR', name: 'Carbón Lavado', hex: '#1F2937' },
  { code: 'MOS', name: 'Mostaza Ocre', hex: '#CA8A04' }
];

export interface Store {
  id: string;
  name: string;
  shortCode: string;
  municipality: string; // Valle de Aburrá: Medellín, Bello, Sabaneta, Envigado, Itagüí
  address: string;
  phone: string;
  managerName: string;
  isWarehouse?: boolean;
}

export interface ProductVariant {
  sku: string; // e.g. 3103015-0-3M-NEG
  barcode: string; // 13-digit EAN or Code 128
  size: Size;
  color: string;
  colorCode: string;
  colorHex: string;
}

export interface Product {
  id: string;
  code7: string; // GG TT MM C e.g. 3103015
  groupCode: string; // GG
  typeCode: string; // TT
  modelNumber: string; // MM (01-99)
  consecutive: string; // C (1-9)
  name: string;
  description: string;
  seasonId: string;
  seasonName: string;
  price: number; // COP
  cost: number; // COP
  active: boolean;
  minStockAlert: number;
  availableSizes: Size[];
  availableColors: ColorOption[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface StoreInventoryItem {
  storeId: string;
  sku: string;
  productId: string;
  productName: string;
  code7: string;
  size: Size;
  color: string;
  colorHex: string;
  quantity: number;
  minStockAlert: number;
  updatedAt: string;
}

export type MovementType =
  | 'ENTRADA'
  | 'SALIDA_VENTA'
  | 'SALIDA_PERDIDA'
  | 'SALIDA_DEFECTO'
  | 'SALIDA_DONACION'
  | 'SALIDA_OTRO'
  | 'TRANSFERENCIA_SALIDA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'AJUSTE_CONTEO_POSITIVO'
  | 'AJUSTE_CONTEO_NEGATIVO'
  | 'DEVOLUCION_CLIENTE'
  | 'DEVOLUCION_PROVEEDOR';

export interface MovementRecord {
  id: string;
  code: string;
  timestamp: string;
  type: MovementType;
  storeId: string;
  storeName: string;
  targetStoreId?: string;
  targetStoreName?: string;
  sku: string;
  code7: string;
  productName: string;
  size: Size;
  color: string;
  quantity: number; // Always positive magnitude
  previousStock: number;
  newStock: number;
  delta: number; // positive or negative
  userId: string;
  userName: string;
  userRole: UserRole;
  referenceDoc?: string;
  reason: string;
  notes?: string;
}

export type TransferStatus = 'SOLICITADA' | 'APROBADA' | 'EN_TRANSITO' | 'RECIBIDA' | 'RECHAZADA';

export interface TransferItem {
  sku: string;
  productId: string;
  productName: string;
  code7: string;
  size: Size;
  color: string;
  quantity: number;
}

export interface TransferRequest {
  id: string;
  code: string;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  items: TransferItem[];
  status: TransferStatus;
  requestedAt: string;
  requestedBy: { id: string; name: string; email: string };
  respondedAt?: string;
  respondedBy?: { id: string; name: string };
  receivedAt?: string;
  receivedBy?: { id: string; name: string };
  notes?: string;
  rejectionReason?: string;
}

export type PhysicalCountStatus = 'BORRADOR' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

export interface PhysicalCountItem {
  sku: string;
  code7: string;
  productName: string;
  size: Size;
  color: string;
  systemQty: number;
  countedQty: number;
  variance: number; // countedQty - systemQty
  unitCost: number;
  totalVarianceValue: number;
  notes?: string;
  verified: boolean;
}

export interface PhysicalCountAudit {
  id: string;
  code: string;
  storeId: string;
  storeName: string;
  startedAt: string;
  completedAt?: string;
  status: PhysicalCountStatus;
  auditorId: string;
  auditorName: string;
  supervisorName?: string;
  adjustmentApplied: boolean;
  adjustmentReason?: string;
  notes?: string;
  items: PhysicalCountItem[];
}

export type UserRole = 'admin_general' | 'admin_tienda' | 'empleado_operativo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string; // Optional: assigned store for store admin & staff
  storeName?: string;
  avatar?: string;
}

export interface SeasonCollection {
  id: string;
  name: string;
  year: number;
  active: boolean;
  description: string;
}

export type PrintDeviceFormat = 'thermal_58' | 'thermal_80' | 'sheet_a4';

export interface PrintSettings {
  format: PrintDeviceFormat;
  showPrice: boolean;
  showBarcode: boolean;
  showLogo: boolean;
  showStoreName: boolean;
  copiesPerItem: number;
}
