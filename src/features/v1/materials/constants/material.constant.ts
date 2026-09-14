/** Constants Master Material. */
export const materialConstant = {
  // menuCode mengikuti nilai di Menu table (wms-user-dev) — bukan MASTER-MATERIAL
  menuCode: 'MATERIAL',
  alnumPattern: '^[a-zA-Z0-9\\[\\]\\(\\)\\-\\/\\#\\&\\+,.!? ]*$',
  // nilai enum diambil dari data existing saat setup menu — jangan tambah sembarangan
  categories: ['Part', 'Non-Part'] as const,
  uomDefault: 'Pcs',
  key: { code: 'code', barcode: 'barcode', category: 'category', id: 'id' },
  messages: {
    codeExists: 'Material code already exists for this customer',
    notFound: 'Material not found',
    barcodeNotAvailable: 'Barcode is not available in UPCA pool',
    codeImmutable: 'Material code cannot be changed',
    barcodeImmutable: 'Material barcode cannot be changed',
    inUseMapping: 'Material is still used by active material mapping(s)',
  },
  searchByFields: ['code', 'name', 'brand', 'category'] as const,
  orderFields: ['code', 'name', 'createdDate'] as const,
};
