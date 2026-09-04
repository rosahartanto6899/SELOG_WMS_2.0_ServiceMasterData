/** Constants Master Location. */
export const locationConstant = {
  menuCode: 'MASTER-LOCATION',
  alnumPattern: '^[a-zA-Z0-9\\[\\]\\(\\)\\-\\/\\#\\&\\+,.!? ]*$',
  // paritas opsi lama (MstLocation.cshtml categoryInput)
  categories: ['Binning Location'] as const,
  key: { code: 'code', barcode: 'barcode', zoneId: 'zoneId', id: 'id' },
  messages: {
    codeExists: 'Location code already exists for this customer & warehouse',
    notFound: 'Location not found',
    barcodeNotAvailable: 'Barcode is not available in UPCA pool',
    zoneNotFound: 'Zone not found',
    codeImmutable: 'Location code cannot be changed',
    barcodeImmutable: 'Location barcode cannot be changed',
    inUseMapping: 'Location is still used by active material mapping(s)',
  },
  searchByFields: ['code', 'name', 'category', 'description'] as const,
  orderFields: ['code', 'name', 'createdDate'] as const,
};
