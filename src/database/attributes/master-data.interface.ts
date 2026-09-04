/**
 * Attributes master data WMS (tabel existing di wms-masterdata-dev,
 * skema GUID varchar(36) + soft delete DeletedDate/DeletedBy).
 */

export interface MstZoneAttributes {
  id?: string;
  customerCode?: string | null;
  customerName?: string | null;
  warehouseCode?: string | null;
  warehouseName?: string | null;
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  createdDate?: Date;
  createdBy?: string | null;
  modifiedDate?: Date | null;
  modifiedBy?: string | null;
  deletedBy?: string | null;
  deletedDate?: Date | null;
}

export interface MstLocationAttributes {
  id?: string;
  customerCode?: string | null;
  customerName?: string | null;
  warehouseCode?: string | null;
  warehouseName?: string | null;
  code?: string;
  name?: string;
  barcode?: string | null;
  description?: string | null;
  category?: string | null;
  zoneId?: string | null;
  isActive?: boolean;
  createdDate?: Date;
  createdBy?: string | null;
  modifiedDate?: Date | null;
  modifiedBy?: string | null;
  deletedBy?: string | null;
  deletedDate?: Date | null;
}

export interface MstMaterialAttributes {
  id?: string;
  customerCode?: string | null;
  customerName?: string | null;
  code?: string;
  name?: string;
  brand?: string | null;
  barcode?: string | null;
  description?: string | null;
  category?: string;
  uoM?: string | null;
  isActive?: boolean;
  createdDate?: Date;
  createdBy?: string | null;
  modifiedDate?: Date | null;
  modifiedBy?: string | null;
  deletedBy?: string | null;
  deletedDate?: Date | null;
}

export interface MstMaterialLocationMappingAttributes {
  id?: string;
  customerCode?: string;
  customerName?: string;
  warehouseCode?: string;
  warehouseName?: string;
  materialId?: string | null;
  locationId?: string | null;
  isActive?: boolean;
  createdDate?: Date;
  createdBy?: string | null;
  modifiedDate?: Date | null;
  modifiedBy?: string | null;
  deletedBy?: string | null;
  deletedDate?: Date | null;
}

export interface MstUpcaBarcodeAttributes {
  id?: string;
  barcode?: string;
  isMaterialUsed?: boolean | null;
  isLocationUsed?: boolean | null;
  createdDate?: Date | null;
  createdBy?: string | null;
  modifiedDate?: Date | null;
  modifiedBy?: string | null;
  deletedBy?: string | null;
  deletedDate?: Date | null;
}
