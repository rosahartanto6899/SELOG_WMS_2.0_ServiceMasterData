/** Constants Master Zone (menuCode placeholder — sesuaikan master menu WMS 2.0). */
export const zoneConstant = {
  menuCode: 'MASTER-ZONE',
  // pola regex alfanumerik-plus lama (entity MstLocation/MstMaterial CoreApp)
  alnumPattern: '^[a-zA-Z0-9\\[\\]\\(\\)\\-\\/\\#\\&\\+,.!? ]*$',
  key: { code: 'code', name: 'name', id: 'id' },
  messages: {
    codeExists: 'Zone code already exists for this customer & warehouse',
    notFound: 'Zone not found',
    inUseLocation: 'Zone is still used by active location(s)',
    codeImmutable: 'Zone code cannot be changed',
  },
  searchByFields: ['code', 'name'] as const,
  orderFields: ['code', 'name', 'createdDate'] as const,
};
