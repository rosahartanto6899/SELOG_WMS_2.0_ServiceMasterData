import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { materialLocationMappingConstant as cst } from '../constants/material-location-mapping.constant';

const alnumPattern = '^[a-zA-Z0-9\\[\\]\\(\\)\\-\\/\\#\\&\\+,.!? ]*$';

/**
 * @swagger
 * components:
 *   schemas:
 *     UpsertMaterialLocationMappingDto:
 *       type: object
 *       required: [warehouseCode, materialCode, locationName]
 *       properties:
 *         warehouseCode: { type: string, maxLength: 50, example: "WH001" }
 *         warehouseName: { type: string, maxLength: 100 }
 *         materialCode: { type: string, maxLength: 100, example: "MAT001" }
 *         locationName: { type: string, maxLength: 100, example: "Rack A-01" }
 *         materialName: { type: string, maxLength: 200 }
 *         materialBrand: { type: string, maxLength: 100 }
 *         no: { type: integer, description: FE row tracker (unused by BE) }
 *         upsertStatus: { type: string, maxLength: 50, description: FE row tracker (unused by BE) }
 *         upsertReason: { type: string, maxLength: 200, description: FE row tracker (unused by BE) }
 */
export class UpsertMaterialLocationMappingDto {
  // Wajib — service match location & natural key per warehouse
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  warehouseCode: string;

  @IsOptional() @IsString() @MaxLength(100) warehouseName?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(alnumPattern))
  materialCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(alnumPattern))
  locationName: string;

  @IsOptional() @IsString() @MaxLength(200) materialName?: string;
  @IsOptional() @IsString() @MaxLength(100) materialBrand?: string;

  // Metadata FE (row tracker upload) — diterima, tidak dipakai BE (pola AHM)
  @IsOptional() @IsInt() no?: number;
  @IsOptional() @IsString() @MaxLength(50) upsertStatus?: string;
  @IsOptional() @IsString() @MaxLength(200) upsertReason?: string;
}

export class ListMappingQueryDto {
  @IsOptional() @IsString() customerCode?: string;
  @IsOptional() @IsString() warehouseCode?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(cst.searchByFields) searchBy?: string;
  @IsOptional() @IsIn(cst.orderFields) order?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}
