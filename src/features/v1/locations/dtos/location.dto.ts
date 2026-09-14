import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { locationConstant as cst } from '../constants/location.constant';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateLocationDto:
 *       type: object
 *       required: [warehouseCode, code, name, barcode, zoneId]
 *       properties:
 *         warehouseCode: { type: string, maxLength: 50, example: "WH001" }
 *         warehouseName: { type: string, maxLength: 75, example: "Warehouse 1" }
 *         code: { type: string, maxLength: 50, example: "LOC001" }
 *         name: { type: string, maxLength: 100, example: "Rack A-01" }
 *         barcode: { type: string, pattern: '^\\d{12}$', example: "012345678905" }
 *         zoneId: { type: string, format: uuid }
 *         category: { type: string, enum: [Binning Location] }
 *         description: { type: string, maxLength: 200 }
 */
export class CreateLocationDto {
  @IsNotEmpty() @IsString() @MaxLength(50) warehouseCode: string;
  @IsOptional() @IsString() @MaxLength(75) warehouseName?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Matches(new RegExp(cst.alnumPattern))
  code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(cst.alnumPattern))
  name: string;

  @IsNotEmpty() @IsString() @Matches(/^\d{12}$/) barcode: string;

  @IsUUID() zoneId: string;

  @IsOptional() @IsIn(cst.categories) category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(new RegExp(cst.alnumPattern))
  description?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateLocationDto:
 *       type: object
 *       required: [name, zoneId]
 *       properties:
 *         name: { type: string, maxLength: 100, example: "Rack A-01" }
 *         zoneId: { type: string, format: uuid }
 *         category: { type: string, enum: [Binning Location] }
 *         description: { type: string, maxLength: 200 }
 */
export class UpdateLocationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(cst.alnumPattern))
  name: string;

  @IsUUID() zoneId: string;

  @IsOptional() @IsIn(cst.categories) category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(new RegExp(cst.alnumPattern))
  description?: string;
}

export class ListLocationQueryDto {
  @IsOptional() @IsString() customerCode?: string;
  @IsOptional() @IsString() warehouseCode?: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(cst.searchByFields) searchBy?: string;
  @IsOptional() @IsIn(cst.orderFields) order?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}

export class LocationIdParamDto {
  @IsNotEmpty() @IsString() id: string;
}

export class BarcodeLabelDto {
  @IsNotEmpty() @IsString() @Matches(/^\d{11,12}$/) barcode: string;
  @IsOptional() @IsString() @MaxLength(100) code?: string;
  @IsOptional() @IsString() @MaxLength(100) name?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     BarcodeLabelsBodyDto:
 *       type: object
 *       required: [items]
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required: [barcode]
 *             properties:
 *               barcode: { type: string, pattern: '^\\d{11,12}$', example: "012345678905" }
 *               code: { type: string, maxLength: 100 }
 *               name: { type: string, maxLength: 100 }
 */
export class BarcodeLabelsBodyDto {
  @IsNotEmpty() items: BarcodeLabelDto[];
}
