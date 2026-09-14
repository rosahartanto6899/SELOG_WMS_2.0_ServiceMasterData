/**
 * Constants Upload Material–Location Mapping (pola upload-incoming-ahm).
 * Header label mengikuti template lama Template-UploadMaterialLocationMapping.xlsx.
 */

export interface MappingColumn {
  header: string;
  key: string;
  width: number;
  optional?: boolean;
  refSheet?: string; // kolom dropdown — sumber sheet ref
}

export const materialLocationMappingConstant = {
  menuCode: 'MASTER-MATERIAL-MAPPING',
  menuCodeUpload: 'MASTER-MATERIAL-MAPPING',

  // === Excel workbook conventions (pola ServiceVehicle/AHM) ===
  excelSheetMain: 'Formulir input',
  excelSheetBodyKey: 'Ref_bodyKey',
  excelSheetRefMaterial: 'Ref_material',
  excelSheetRefLocation: 'Ref_location',
  excelSheetStateVeryHidden: 'veryHidden' as const,
  keyName: 'name',
  keyId: 'id',
  stringTypePattern: 'pattern',
  stringPatternSolid: 'solid',
  yellowHexColor: 'FFFF00',
  headerRowNumber: 5,
  // ponytail: dropdown diterapkan 5000 baris pertama (ukuran file); batas upload tetap 25000
  dropdownRows: 5000,
  stringHeaderNameContentType: 'Content-Type',
  stringHeaderValueSpreadsheet:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  stringHeaderNameContentDisposition: 'Content-Disposition',
  stringHeaderValueFilename:
    'attachment; filename=Template-UploadMaterialLocationMapping.xlsx',

  excelMandatoryRead: 'MANDATORY READ',
  excelInstructionPoint1:
    '1. Isi kolom Material Code dan Location Name menggunakan dropdown yang tersedia (data master live).',
  excelInstructionPoint2:
    '2. Kolom kuning opsional. Material Name & Brand hanya info — otomatis dari master.',

  columns: [
    { header: 'Material Code', key: 'materialCode', width: 30, refSheet: 'Ref_material' },
    { header: 'Material Name', key: 'materialName', width: 40, optional: true },
    { header: 'Material Brand', key: 'materialBrand', width: 25, optional: true },
    { header: 'Location Name', key: 'locationName', width: 35, refSheet: 'Ref_location' },
  ] as MappingColumn[],

  exampleRow: ['(pilih dari dropdown)', '', '', '(pilih dari dropdown)'],

  key: {
    materialCode: 'materialCode',
    locationName: 'locationName',
  },
  messages: {
    templateHeadersKeyNotMatch: 'Template headers and keys do not match',
    materialNotFound: 'Material code is not registered for this customer',
    locationNotFound: 'Location name is not registered for this warehouse',
  },
  searchByFields: ['materialCode', 'locationName'] as const,
  orderFields: ['createdDate', 'materialCode'] as const,
};
