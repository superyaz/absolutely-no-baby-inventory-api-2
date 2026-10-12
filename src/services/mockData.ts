import {
  Product,
  Store,
  StoreInventoryItem,
  MovementRecord,
  TransferRequest,
  PhysicalCountAudit,
  User,
  SeasonCollection,
  COLORS
} from '../types/inventory';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-tesoro',
    name: 'Tienda El Tesoro',
    shortCode: 'TES',
    municipality: 'Medellín (El Poblado)',
    address: 'Cra 25A #1A Sur 45, Local 322',
    phone: '(604) 321-4500',
    managerName: 'Mateo Arango'
  },
  {
    id: 'store-fabricato',
    name: 'Tienda Parque Fabricato',
    shortCode: 'BEL',
    municipality: 'Bello',
    address: 'Cra 50 #38A-185, Local 210',
    phone: '(604) 480-1200',
    managerName: 'Camila Gómez'
  },
  {
    id: 'store-mayorca',
    name: 'Tienda Mayorca Mega Plaza',
    shortCode: 'MAY',
    municipality: 'Sabaneta / Envigado',
    address: 'Cl. 51 Sur #48-57, Etapa 1 Local 145',
    phone: '(604) 373-8900',
    managerName: 'Daniel Valencia'
  },
  {
    id: 'store-laureles',
    name: 'Tienda Viva Laureles',
    shortCode: 'LAU',
    municipality: 'Medellín (Laureles)',
    address: 'Cra 81 #37-100, Nivel 2 Local 204',
    phone: '(604) 412-6500',
    managerName: 'Laura Ospina'
  },
  {
    id: 'store-arkadia',
    name: 'Tienda Arkadia',
    shortCode: 'ARK',
    municipality: 'Medellín (Belén)',
    address: 'Cra 70 #1-141, Local 188',
    phone: '(604) 604-3322',
    managerName: 'Santiago Betancur'
  },
  {
    id: 'store-central',
    name: 'Bodega Central y Distribución',
    shortCode: 'CEN',
    municipality: 'Itagüí',
    address: 'Autopista Sur #55-12, Parque Industrial',
    phone: '(604) 372-1010',
    managerName: 'Valentina Restrepo',
    isWarehouse: true
  }
];

export const INITIAL_SEASONS: SeasonCollection[] = [
  {
    id: 'season-2026-urban',
    name: 'Colección Urbana Medellín 2026',
    year: 2026,
    active: true,
    description: 'Estilo street rock monocromo con acentos rojos y cortes desestructurados.'
  },
  {
    id: 'season-basics',
    name: 'Línea Esenciales Monocromo',
    year: 2026,
    active: true,
    description: 'Prendas básicas permanentes 100% algodón peinado de alta densidad.'
  },
  {
    id: 'season-capsule-punk',
    name: 'Cápsula Rebelde Absolutely',
    year: 2025,
    active: false,
    description: 'Edición limitada con estampados serigráficos de alto relieve.'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Valentina Restrepo',
    email: 'valentina@absolutelynobaby.com',
    role: 'admin_general',
    storeName: 'Todas las Tiendas (Valle de Aburrá)'
  },
  {
    id: 'user-tesoro',
    name: 'Mateo Arango',
    email: 'mateo.tesoro@absolutelynobaby.com',
    role: 'admin_tienda',
    storeId: 'store-tesoro',
    storeName: 'Tienda El Tesoro'
  },
  {
    id: 'user-bello',
    name: 'Camila Gómez',
    email: 'camila.bello@absolutelynobaby.com',
    role: 'admin_tienda',
    storeId: 'store-fabricato',
    storeName: 'Tienda Parque Fabricato (Bello)'
  },
  {
    id: 'user-staff',
    name: 'Sebastián Muñoz',
    email: 'sebastian.staff@absolutelynobaby.com',
    role: 'empleado_operativo',
    storeId: 'store-tesoro',
    storeName: 'Tienda El Tesoro'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-3103015',
    code7: '3103015',
    groupCode: '31',
    typeCode: '03',
    modelNumber: '01',
    consecutive: '5',
    name: 'Camiseta Born Free Skull',
    description: 'Camiseta manga corta bebé con estampado tipográfico serigráfico Absolutely.',
    seasonId: 'season-2026-urban',
    seasonName: 'Colección Urbana Medellín 2026',
    price: 49900,
    cost: 18500,
    active: true,
    minStockAlert: 3,
    availableSizes: ['3-6M', '6-9M', '12-18M'],
    availableColors: [COLORS[0], COLORS[1], COLORS[4]], // Negro, Blanco, Rojo
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-01T15:30:00Z',
    variants: [
      { sku: '3103015-3-6M-NEG', barcode: '7703103015011', size: '3-6M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3103015-6-9M-NEG', barcode: '7703103015028', size: '6-9M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3103015-12-18M-NEG', barcode: '7703103015035', size: '12-18M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3103015-3-6M-BLA', barcode: '7703103015042', size: '3-6M', color: 'Blanco Óptico', colorCode: 'BLA', colorHex: '#FFFFFF' },
      { sku: '3103015-12-18M-ROJ', barcode: '7703103015059', size: '12-18M', color: 'Rojo Rebelde', colorCode: 'ROJ', colorHex: '#DC2626' }
    ]
  },
  {
    id: 'prod-3206012',
    code7: '3206012',
    groupCode: '32',
    typeCode: '06',
    modelNumber: '01',
    consecutive: '2',
    name: 'Vestido Tutú Dark Princess',
    description: 'Vestido en capas de tul negro con pechera en algodón suave para bebé.',
    seasonId: 'season-2026-urban',
    seasonName: 'Colección Urbana Medellín 2026',
    price: 79900,
    cost: 29000,
    active: true,
    minStockAlert: 2,
    availableSizes: ['6-9M', '12-18M', '18-24M'],
    availableColors: [COLORS[0], COLORS[3]],
    createdAt: '2026-09-05T11:00:00Z',
    updatedAt: '2026-10-02T09:20:00Z',
    variants: [
      { sku: '3206012-6-9M-NEG', barcode: '7703206012015', size: '6-9M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3206012-12-18M-NEG', barcode: '7703206012022', size: '12-18M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3206012-18-24M-NEG', barcode: '7703206012039', size: '18-24M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' }
    ]
  },
  {
    id: 'prod-3301011',
    code7: '3301011',
    groupCode: '33',
    typeCode: '01',
    modelNumber: '01',
    consecutive: '1',
    name: 'Body Esencial No Baby Logo',
    description: 'Body unisex con broches niquelados libres de plomo y emblema circular.',
    seasonId: 'season-basics',
    seasonName: 'Línea Esenciales Monocromo',
    price: 42900,
    cost: 14000,
    active: true,
    minStockAlert: 5,
    availableSizes: ['0-3M', '3-6M', '6-9M'],
    availableColors: [COLORS[0], COLORS[1]],
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
    variants: [
      { sku: '3301011-0-3M-NEG', barcode: '7703301011019', size: '0-3M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3301011-3-6M-NEG', barcode: '7703301011026', size: '3-6M', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '3301011-6-9M-BLA', barcode: '7703301011033', size: '6-9M', color: 'Blanco Óptico', colorCode: 'BLA', colorHex: '#FFFFFF' }
    ]
  },
  {
    id: 'prod-4104013',
    code7: '4104013',
    groupCode: '41',
    typeCode: '04',
    modelNumber: '01',
    consecutive: '3',
    name: 'Pantalón Cargo Riot Urbano',
    description: 'Pantalón con bolsillos fuelle laterales y cintura elástica ajustable.',
    seasonId: 'season-2026-urban',
    seasonName: 'Colección Urbana Medellín 2026',
    price: 89900,
    cost: 34000,
    active: true,
    minStockAlert: 2,
    availableSizes: ['4T', '6', '8'],
    availableColors: [COLORS[0], COLORS[7]],
    createdAt: '2026-09-12T14:00:00Z',
    updatedAt: '2026-10-03T16:00:00Z',
    variants: [
      { sku: '4104013-4T-NEG', barcode: '7704104013010', size: '4T', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '4104013-6-NEG', barcode: '7704104013027', size: '6', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '4104013-8-VOL', barcode: '7704104013034', size: '8', color: 'Verde Militar', colorCode: 'VOL', colorHex: '#3F6212' }
    ]
  },
  {
    id: 'prod-4207011',
    code7: '4207011',
    groupCode: '42',
    typeCode: '07',
    modelNumber: '01',
    consecutive: '1',
    name: 'Falda Plisada Heavy Rocker',
    description: 'Falda de pliegues en drill rígido con detalle de cadena metálica desmontable.',
    seasonId: 'season-2026-urban',
    seasonName: 'Colección Urbana Medellín 2026',
    price: 65900,
    cost: 24000,
    active: true,
    minStockAlert: 2,
    availableSizes: ['4T', '6'],
    availableColors: [COLORS[0], COLORS[4]],
    createdAt: '2026-09-18T16:00:00Z',
    updatedAt: '2026-10-04T11:00:00Z',
    variants: [
      { sku: '4207011-4T-NEG', barcode: '7704207011018', size: '4T', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '4207011-6-ROJ', barcode: '7704207011025', size: '6', color: 'Rojo Rebelde', colorCode: 'ROJ', colorHex: '#DC2626' }
    ]
  },
  {
    id: 'prod-5108012',
    code7: '5108012',
    groupCode: '51',
    typeCode: '08',
    modelNumber: '01',
    consecutive: '2',
    name: 'Chaqueta Biker Cuero Sintético',
    description: 'Chaqueta estilo motociclista con cremalleras cruzadas y forro térmico suave.',
    seasonId: 'season-2026-urban',
    seasonName: 'Colección Urbana Medellín 2026',
    price: 149900,
    cost: 58000,
    active: true,
    minStockAlert: 1,
    availableSizes: ['10', '12', '14'],
    availableColors: [COLORS[0]],
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-10-04T18:00:00Z',
    variants: [
      { sku: '5108012-10-NEG', barcode: '7705108012013', size: '10', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '5108012-12-NEG', barcode: '7705108012020', size: '12', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '5108012-14-NEG', barcode: '7705108012037', size: '14', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' }
    ]
  },
  {
    id: 'prod-5209014',
    code7: '5209014',
    groupCode: '52',
    typeCode: '09',
    modelNumber: '01',
    consecutive: '4',
    name: 'Buzo Hoodie Oversize Aburrá',
    description: 'Buzo capota corte amplio con bolsillo canguro y bordado frontal.',
    seasonId: 'season-2026-urban',
    seasonName: 'Colección Urbana Medellín 2026',
    price: 98900,
    cost: 38000,
    active: true,
    minStockAlert: 2,
    availableSizes: ['12', '14', '16'],
    availableColors: [COLORS[0], COLORS[2]],
    createdAt: '2026-09-22T10:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
    variants: [
      { sku: '5209014-12-NEG', barcode: '7705209014016', size: '12', color: 'Negro Profundo', colorCode: 'NEG', colorHex: '#000000' },
      { sku: '5209014-14-GOS', barcode: '7705209014023', size: '14', color: 'Gris Oscuro', colorCode: 'GOS', colorHex: '#374151' }
    ]
  }
];

export const INITIAL_INVENTORY: StoreInventoryItem[] = [
  // Requirement example from page 4:
  // "Bello: 4 camisas disponibles. El Tesoro: 0 unidades. El Tesoro solicita 2 unidades. Bello acepta."
  // SKU: 3103015-3-6M-NEG
  {
    storeId: 'store-fabricato', // Bello
    sku: '3103015-3-6M-NEG',
    productId: 'prod-3103015',
    productName: 'Camiseta Born Free Skull',
    code7: '3103015',
    size: '3-6M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 4, // Exactly as PDF
    minStockAlert: 2,
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    storeId: 'store-tesoro', // El Tesoro
    sku: '3103015-3-6M-NEG',
    productId: 'prod-3103015',
    productName: 'Camiseta Born Free Skull',
    code7: '3103015',
    size: '3-6M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 0, // Exactly as PDF
    minStockAlert: 2,
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    storeId: 'store-central', // Warehouse
    sku: '3103015-3-6M-NEG',
    productId: 'prod-3103015',
    productName: 'Camiseta Born Free Skull',
    code7: '3103015',
    size: '3-6M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 48,
    minStockAlert: 10,
    updatedAt: '2026-10-05T08:00:00Z'
  },
  {
    storeId: 'store-fabricato',
    sku: '3103015-6-9M-NEG',
    productId: 'prod-3103015',
    productName: 'Camiseta Born Free Skull',
    code7: '3103015',
    size: '6-9M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 6,
    minStockAlert: 2,
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    storeId: 'store-tesoro',
    sku: '3103015-6-9M-NEG',
    productId: 'prod-3103015',
    productName: 'Camiseta Born Free Skull',
    code7: '3103015',
    size: '6-9M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 1, // Low stock alert!
    minStockAlert: 3,
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    storeId: 'store-mayorca',
    sku: '3103015-6-9M-NEG',
    productId: 'prod-3103015',
    productName: 'Camiseta Born Free Skull',
    code7: '3103015',
    size: '6-9M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 5,
    minStockAlert: 2,
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    storeId: 'store-tesoro',
    sku: '3206012-6-9M-NEG',
    productId: 'prod-3206012',
    productName: 'Vestido Tutú Dark Princess',
    code7: '3206012',
    size: '6-9M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 5,
    minStockAlert: 2,
    updatedAt: '2026-10-05T11:00:00Z'
  },
  {
    storeId: 'store-fabricato',
    sku: '3206012-6-9M-NEG',
    productId: 'prod-3206012',
    productName: 'Vestido Tutú Dark Princess',
    code7: '3206012',
    size: '6-9M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 3,
    minStockAlert: 2,
    updatedAt: '2026-10-05T11:00:00Z'
  },
  {
    storeId: 'store-central',
    sku: '3206012-6-9M-NEG',
    productId: 'prod-3206012',
    productName: 'Vestido Tutú Dark Princess',
    code7: '3206012',
    size: '6-9M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 25,
    minStockAlert: 5,
    updatedAt: '2026-10-04T08:00:00Z'
  },
  {
    storeId: 'store-laureles',
    sku: '3301011-0-3M-NEG',
    productId: 'prod-3301011',
    productName: 'Body Esencial No Baby Logo',
    code7: '3301011',
    size: '0-3M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 8,
    minStockAlert: 3,
    updatedAt: '2026-10-05T09:30:00Z'
  },
  {
    storeId: 'store-tesoro',
    sku: '3301011-0-3M-NEG',
    productId: 'prod-3301011',
    productName: 'Body Esencial No Baby Logo',
    code7: '3301011',
    size: '0-3M',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 12,
    minStockAlert: 4,
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    storeId: 'store-arkadia',
    sku: '4104013-4T-NEG',
    productId: 'prod-4104013',
    productName: 'Pantalón Cargo Riot Urbano',
    code7: '4104013',
    size: '4T',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 4,
    minStockAlert: 2,
    updatedAt: '2026-10-05T11:20:00Z'
  },
  {
    storeId: 'store-tesoro',
    sku: '4104013-4T-NEG',
    productId: 'prod-4104013',
    productName: 'Pantalón Cargo Riot Urbano',
    code7: '4104013',
    size: '4T',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 3,
    minStockAlert: 2,
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    storeId: 'store-tesoro',
    sku: '5108012-10-NEG',
    productId: 'prod-5108012',
    productName: 'Chaqueta Biker Cuero Sintético',
    code7: '5108012',
    size: '10',
    color: 'Negro Profundo',
    colorHex: '#000000',
    quantity: 2,
    minStockAlert: 1,
    updatedAt: '2026-10-05T12:30:00Z'
  }
];

export const INITIAL_MOVEMENTS: MovementRecord[] = [
  {
    id: 'mov-1001',
    code: 'MOV-2610-001',
    timestamp: '2026-10-04T09:15:00Z',
    type: 'ENTRADA',
    storeId: 'store-central',
    storeName: 'Bodega Central y Distribución',
    sku: '3103015-3-6M-NEG',
    code7: '3103015',
    productName: 'Camiseta Born Free Skull',
    size: '3-6M',
    color: 'Negro Profundo',
    quantity: 50,
    previousStock: 0,
    newStock: 50,
    delta: 50,
    userId: 'user-admin',
    userName: 'Valentina Restrepo',
    userRole: 'admin_general',
    referenceDoc: 'FAC-PROV-9942',
    reason: 'Ingreso lote de producción textil Medellín',
    notes: 'Recepción conforme de 50 unidades calidad A1.'
  },
  {
    id: 'mov-1002',
    code: 'MOV-2610-002',
    timestamp: '2026-10-04T14:30:00Z',
    type: 'SALIDA_VENTA',
    storeId: 'store-tesoro',
    storeName: 'Tienda El Tesoro',
    sku: '3301011-0-3M-NEG',
    code7: '3301011',
    productName: 'Body Esencial No Baby Logo',
    size: '0-3M',
    color: 'Negro Profundo',
    quantity: 1,
    previousStock: 13,
    newStock: 12,
    delta: -1,
    userId: 'user-staff',
    userName: 'Sebastián Muñoz',
    userRole: 'empleado_operativo',
    referenceDoc: 'POS-TES-8812',
    reason: 'Venta presencial mostrador',
    notes: 'Cliente llevó con bolsa institucional.'
  },
  {
    id: 'mov-1003',
    code: 'MOV-2610-003',
    timestamp: '2026-10-05T08:45:00Z',
    type: 'TRANSFERENCIA_SALIDA',
    storeId: 'store-central',
    storeName: 'Bodega Central y Distribución',
    targetStoreId: 'store-fabricato',
    targetStoreName: 'Tienda Parque Fabricato',
    sku: '3103015-3-6M-NEG',
    code7: '3103015',
    productName: 'Camiseta Born Free Skull',
    size: '3-6M',
    color: 'Negro Profundo',
    quantity: 4,
    previousStock: 52,
    newStock: 48,
    delta: -4,
    userId: 'user-admin',
    userName: 'Valentina Restrepo',
    userRole: 'admin_general',
    referenceDoc: 'GUIA-DESP-044',
    reason: 'Despacho reposición inicial para apertura Bello'
  }
];

export const INITIAL_TRANSFERS: TransferRequest[] = [
  {
    id: 'trf-2610-001',
    code: 'TRF-ABURRA-001',
    fromStoreId: 'store-fabricato',
    fromStoreName: 'Tienda Parque Fabricato (Bello)',
    toStoreId: 'store-tesoro',
    toStoreName: 'Tienda El Tesoro (Medellín)',
    items: [
      {
        sku: '3103015-3-6M-NEG',
        productId: 'prod-3103015',
        productName: 'Camiseta Born Free Skull',
        code7: '3103015',
        size: '3-6M',
        color: 'Negro Profundo',
        quantity: 2
      }
    ],
    status: 'SOLICITADA',
    requestedAt: '2026-10-05T11:00:00Z',
    requestedBy: {
      id: 'user-tesoro',
      name: 'Mateo Arango',
      email: 'mateo.tesoro@absolutelynobaby.com'
    },
    notes: 'Cliente en mostrador solicitando 2 prendas para regalo. En Tesoro estamos en 0 unidades y Bello cuenta con 4 en existencia.'
  }
];

export const INITIAL_AUDITS: PhysicalCountAudit[] = [
  {
    id: 'audit-2609-01',
    code: 'AUD-TES-2609',
    storeId: 'store-tesoro',
    storeName: 'Tienda El Tesoro',
    startedAt: '2026-09-30T19:00:00Z',
    completedAt: '2026-09-30T21:15:00Z',
    status: 'COMPLETADO',
    auditorId: 'user-tesoro',
    auditorName: 'Mateo Arango',
    supervisorName: 'Valentina Restrepo',
    adjustmentApplied: true,
    adjustmentReason: 'Cierre mensual conteo físico estantería y bodega posterior.',
    notes: 'Diferencia de 1 body sobrante por devolución no asentada previamente.',
    items: [
      {
        sku: '3301011-0-3M-NEG',
        code7: '3301011',
        productName: 'Body Esencial No Baby Logo',
        size: '0-3M',
        color: 'Negro Profundo',
        systemQty: 11,
        countedQty: 12,
        variance: 1,
        unitCost: 14000,
        totalVarianceValue: 14000,
        verified: true,
        notes: 'Sobrante justificado por cambio directo de talla.'
      }
    ]
  }
];
