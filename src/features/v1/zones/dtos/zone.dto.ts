import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { zoneConstant as cst } from '../constants/zone.constant';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateZoneDto:
 *       type: object
 *       required: [code, name]
 *       properties:
 *         code: { type: string, maxLength: 50, example: "ZN001" }
 *         name: { type: string, maxLength: 75, example: "Zone A" }
 *         description: { type: string, maxLength: 200 }
 */
export class CreateZoneDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Matches(new RegExp(cst.alnumPattern))
  code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(75)
  @Matches(new RegExp(cst.alnumPattern))
  name: string;

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
 *     UpdateZoneDto:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, maxLength: 75, example: "Zone A" }
 *         description: { type: string, maxLength: 200 }
 */
export class UpdateZoneDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(75)
  @Matches(new RegExp(cst.alnumPattern))
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(new RegExp(cst.alnumPattern))
  description?: string;
}

export class ListZoneQueryDto {
  @IsOptional() @IsString() customerCode?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(cst.searchByFields) searchBy?: string;
  @IsOptional() @IsIn(cst.orderFields) order?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

export class ZoneIdParamDto {
  // kolom DB uniqueidentifier — id non-UUID bikin MSSQL conversion error (500), bukan 404/422
  @IsUUID() id: string;
}
