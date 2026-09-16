import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
  request,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import { queryDto } from '@/utils';
import { BodyValidation, ParamValidation, QueryValidation } from '@/shared-libs/base';
import {
  ControllerLogging,
  MICROSERVICE_IDENTIFIERS,
  ValidatePermissions,
} from '@/shared-libs';
import { materialConstant as cst } from './constants/material.constant';
import {
  CreateMaterialDto,
  ListMaterialQueryDto,
  MaterialDropdownQueryDto,
  MaterialIdParamDto,
  UpdateMaterialDto,
} from './dtos/material.dto';
import { MaterialsCommandService } from './materials.command.service';
import { MaterialsQueryService } from './materials.query.service';
import {
  BarcodeLabelsBodyDto,
} from '@/features/v1/locations/dtos/location.dto';

/**
 * @swagger
 * tags:
 *   - name: Materials
 *     description: Master material CRUD + UPCA barcode pool & label print
 */
@controller('/v1/materials')
export class MaterialsController extends BaseHttpController {
  private static readonly materialsLogging = ControllerLogging.forEntity(
    'materials',
    MICROSERVICE_IDENTIFIERS.SERVICE_MASTER_DATA,
  );

  constructor(
    @inject(MaterialsQueryService)
    private readonly queryService: MaterialsQueryService,
    @inject(MaterialsCommandService)
    private readonly commandService: MaterialsCommandService,
  ) {
    super();
  }

  /**
   * @swagger
   * /v1/materials:
   *   get:
   *     summary: Get all material records (paginated)
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: query
   *         name: customerCode
   *         schema: { type: string }
   *         description: Filter by customer code (admin only — token claim takes precedence)
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Search term
   *       - in: query
   *         name: searchBy
   *         schema: { type: string, enum: [code, name, brand, category] }
   *         description: Field to search by
   *       - in: query
   *         name: order
   *         schema: { type: string, enum: [code, name, createdDate] }
   *         description: Field to order by
   *       - in: query
   *         name: sort
   *         schema: { type: string, enum: [asc, desc] }
   *         description: Sort direction
   *       - in: query
   *         name: page
   *         schema: { type: integer, minimum: 1 }
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema: { type: integer, minimum: 1, maximum: 100 }
   *         description: Number of records per page (max 100)
   *     responses:
   *       200:
   *         description: Successfully retrieved material records
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet('/', QueryValidation(ListMaterialQueryDto), MaterialsController.materialsLogging.list)
  async list(@request() req: Request) {
    return await this.queryService.list(queryDto<ListMaterialQueryDto>(req), req);
  }

  /**
   * @swagger
   * /v1/materials/dropdown:
   *   get:
   *     summary: Get materials for dropdown
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     responses:
   *       200:
   *         description: Successfully retrieved materials dropdown
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet(
    '/dropdown',
    QueryValidation(MaterialDropdownQueryDto),
    MaterialsController.materialsLogging.dropdown,
  )
  async dropdown(@request() req: Request) {
    return await this.queryService.dropdown(queryDto<MaterialDropdownQueryDto>(req), req);
  }

  /**
   * @swagger
   * /v1/materials/available-barcodes:
   *   get:
   *     summary: Get available UPCA barcodes from the pool (up to 200)
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     responses:
   *       200:
   *         description: Successfully retrieved available barcodes
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'CREATE' }],
  })
  @httpGet(
    '/available-barcodes',
    MaterialsController.materialsLogging.custom('available-barcodes'),
  )
  async availableBarcodes() {
    return await this.queryService.availableBarcodes();
  }

  /**
   * @swagger
   * /v1/materials/uom-dropdown:
   *   get:
   *     summary: Get UoM list (MstUoM) for dropdown, ordered by Ordinal
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     responses:
   *       200:
   *         description: Successfully retrieved UoM dropdown
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet(
    '/uom-dropdown',
    MaterialsController.materialsLogging.custom('uom-dropdown'),
  )
  async uomDropdown() {
    return await this.queryService.uomDropdown();
  }

  /**
   * @swagger
   * /v1/materials/barcode-labels:
   *   post:
   *     summary: Render UPCA barcode labels (SVG data-uri) for printing
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/BarcodeLabelsBodyDto' }
   *     responses:
   *       200:
   *         description: Successfully rendered barcode labels
   *       401:
   *         description: Unauthorized
   *       422:
   *         description: Validation errors
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpPost(
    '/barcode-labels',
    BodyValidation(BarcodeLabelsBodyDto),
    MaterialsController.materialsLogging.custom('barcode-labels'),
  )
  async barcodeLabels(@requestBody() body: BarcodeLabelsBodyDto) {
    return await this.queryService.barcodeLabels(body);
  }

  /**
   * @swagger
   * /v1/materials/{id}:
   *   get:
   *     summary: Get material record by ID
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Material record ID
   *     responses:
   *       200:
   *         description: Successfully retrieved material record
   *       404:
   *         description: Material record not found
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet(
    '/:id',
    ParamValidation(MaterialIdParamDto),
    MaterialsController.materialsLogging.view,
  )
  async detail(@requestParam('id') id: string) {
    return await this.queryService.detail(id);
  }

  /**
   * @swagger
   * /v1/materials/internal/by-code/{code}:
   *   get:
   *     summary: Lookup material by code (internal service-to-service, basic auth)
   *     tags: [Materials]
   *     security:
   *       - basicAuth: []
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: customerCode
   *         schema: { type: string }
   *         description: Scope customer aktif (opsional)
   *     responses:
   *       200:
   *         description: Material record (data null jika tidak ditemukan)
   *       401:
   *         description: Unauthorized
   */
  @httpGet(
    '/internal/by-code/:code',
    MaterialsController.materialsLogging.custom('internal-by-code'),
  )
  async internalByCode(
    @requestParam('code') code: string,
    @request() req: Request,
  ) {
    return await this.queryService.internalByCode(
      code,
      (req.query as { customerCode?: string }).customerCode,
    );
  }

  /**
   * @swagger
   * /v1/materials:
   *   post:
   *     summary: Create a new material record
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/CreateMaterialDto' }
   *     responses:
   *       201:
   *         description: Material created successfully
   *       400:
   *         description: Invalid request payload
   *       401:
   *         description: Unauthorized
   *       422:
   *         description: Validation errors
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'CREATE' }],
  })
  @httpPost(
    '/',
    BodyValidation(CreateMaterialDto),
    MaterialsController.materialsLogging.create,
  )
  async create(@requestBody() dto: CreateMaterialDto, @request() req: Request) {
    return await this.commandService.create(dto, req);
  }

  /**
   * @swagger
   * /v1/materials/{id}:
   *   put:
   *     summary: Update material record by ID (code immutable; optional fields omitted are unchanged)
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Material record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/UpdateMaterialDto' }
   *     responses:
   *       200:
   *         description: Material updated successfully
   *       404:
   *         description: Material record not found
   *       401:
   *         description: Unauthorized
   *       422:
   *         description: Validation errors
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'UPDATE' }],
  })
  @httpPut(
    '/:id',
    ParamValidation(MaterialIdParamDto),
    BodyValidation(UpdateMaterialDto),
    MaterialsController.materialsLogging.update,
  )
  async update(
    @requestParam('id') id: string,
    @requestBody() dto: UpdateMaterialDto,
    @request() req: Request,
  ) {
    return await this.commandService.update(id, dto, req);
  }

  /**
   * @swagger
   * /v1/materials/{id}:
   *   delete:
   *     summary: Soft delete material record by ID
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Material record ID
   *     responses:
   *       200:
   *         description: Material deleted successfully
   *       404:
   *         description: Record not found
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'DELETE' }],
  })
  @httpDelete(
    '/:id',
    ParamValidation(MaterialIdParamDto),
    MaterialsController.materialsLogging.delete,
  )
  async remove(@requestParam('id') id: string, @request() req: Request) {
    return await this.commandService.delete(id, req);
  }
}
