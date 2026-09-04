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
import { materialConstant as cst } from '../constants/material.constant';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMaterialDto:
 *       type: object
 *       required: [code, name, category, barcode]
 *       properties:
 *         code: { type: string, maxLength: 100, example: "MAT001" }
 *         name: { type: string, maxLength: 200, example: "Brake Pad Front" }
 *         category: { type: string, enum: [Part, Non-Part], example: "Part" }
 *         barcode: { type: string, pattern: '^\\d{12}$', example: "012345678905" }
 *         brand: { type: string, maxLength: 100, example: "AHM" }
 *         uoM: { type: string, maxLength: 20, example: "PCS" }
 *         description: { type: string, maxLength: 200 }
 */
export class CreateMaterialDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(cst.alnumPattern))
  code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Matches(new RegExp(cst.alnumPattern))
  name: string;

  @IsNotEmpty() @IsIn(cst.categories) category: string;

  @IsNotEmpty() @IsString() @Matches(/^\d{12}$/) barcode: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(cst.alnumPattern))
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(new RegExp(cst.alnumPattern))
  uoM?: string;

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
 *     UpdateMaterialDto:
 *       type: object
 *       required: [name, category]
 *       properties:
 *         name: { type: string, maxLength: 200, example: "Brake Pad Front" }
 *         category: { type: string, enum: [Part, Non-Part], example: "Part" }
 *         brand: { type: string, maxLength: 100, example: "AHM" }
 *         uoM: { type: string, maxLength: 20, example: "PCS" }
 *         description: { type: string, maxLength: 200 }
 */
export class UpdateMaterialDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Matches(new RegExp(cst.alnumPattern))
  name: string;

  @IsNotEmpty() @IsIn(cst.categories) category: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(new RegExp(cst.alnumPattern))
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(new RegExp(cst.alnumPattern))
  uoM?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(new RegExp(cst.alnumPattern))
  description?: string;
}

export class ListMaterialQueryDto {
  @IsOptional() @IsString() customerCode?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(cst.searchByFields) searchBy?: string;
  @IsOptional() @IsIn(cst.orderFields) order?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}

export class MaterialIdParamDto {
  @IsNotEmpty() @IsString() id: string;
}
