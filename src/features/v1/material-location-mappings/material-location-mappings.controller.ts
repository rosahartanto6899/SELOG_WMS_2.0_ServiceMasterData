import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPut,
  request,
  requestBody,
} from 'inversify-express-utils';
import { queryDto } from '@/utils';
import { BodyValidation, QueryValidation } from '@/shared-libs/base';
import {
  ControllerLogging,
  MICROSERVICE_IDENTIFIERS,
  ValidatePermissions,
} from '@/shared-libs';
import { materialLocationMappingConstant as cst } from './constants/material-location-mapping.constant';
import {
  ListMappingQueryDto,
  UpsertMaterialLocationMappingDto,
} from './dtos/material-location-mapping.dto';
import { MaterialLocationMappingsQueryService } from './material-location-mappings.query.service';
import { UploadMaterialLocationMappingCommandService } from './upload-material-location-mapping.command.service';
import { ExcelTemplateService } from './excel-template.service';

/**
 * @swagger
 * tags:
 *   - name: Material Location Mappings
 *     description: Mapping material→location list + bulk upload (Excel pattern AHM)
 */
@controller('/v1/material-location-mappings')
export class MaterialLocationMappingsController extends BaseHttpController {
  private static readonly mappingsLogging = ControllerLogging.forEntity(
    'material-location-mappings',
    MICROSERVICE_IDENTIFIERS.SERVICE_MASTER_DATA,
  );

  constructor(
    @inject(MaterialLocationMappingsQueryService)
    private readonly queryService: MaterialLocationMappingsQueryService,
  ) {
    super();
  }

  /**
   * @swagger
   * /v1/material-location-mappings:
   *   get:
   *     summary: Get all final mappings (join material & location)
   *     tags: [Material Location Mappings]
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
   *         schema: { type: string, enum: [materialCode, locationName] }
   *         description: Field to search by (through join)
   *       - in: query
   *         name: order
   *         schema: { type: string, enum: [createdDate, materialCode] }
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
   *         description: Successfully retrieved mapping list
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [
      { menuCode: cst.menuCode, action: 'READ' },
    ],
  })
  @httpGet(
    '/',
    QueryValidation(ListMappingQueryDto),
    MaterialLocationMappingsController.mappingsLogging.list,
  )
  async list(@request() req: Request) {
    return await this.queryService.list(queryDto<ListMappingQueryDto>(req), req);
  }
}

/**
 * @swagger
 * tags:
 *   - name: Upload Material Location Mapping
 *     description: Bulk upload mapping via Excel template (pattern upload AHM)
 */
@controller('/v1/upload-material-location-mapping')
export class UploadMaterialLocationMappingController extends BaseHttpController {
  private static readonly uploadLogging = ControllerLogging.forEntity(
    'upload-material-location-mapping',
    MICROSERVICE_IDENTIFIERS.SERVICE_MASTER_DATA,
  );

  constructor(
    @inject(UploadMaterialLocationMappingCommandService)
    private readonly commandService: UploadMaterialLocationMappingCommandService,
    @inject(ExcelTemplateService)
    private readonly excelTemplateService: ExcelTemplateService,
  ) {
    super();
  }

  /**
   * @swagger
   * /v1/upload-material-location-mapping/template:
   *   get:
   *     summary: Download Excel template (with dropdown Ref sheets)
   *     tags: [Upload Material Location Mapping]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     responses:
   *       200:
   *         description: Excel template with Ref_bodyKey integrity sheet
   *         content:
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema: { type: string, format: binary }
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [
      { menuCode: cst.menuCodeUpload, action: 'READ' },
    ],
  })
  @httpGet(
    '/template',
    UploadMaterialLocationMappingController.uploadLogging.custom('download-template'),
  )
  async getTemplate(req: Request, res: Response) {
    // file sudah dikirim via res.end() — tidak ada envelope JSON
    await this.excelTemplateService.generateTemplate(req, res);
  }

  /**
   * @swagger
   * /v1/upload-material-location-mapping/bulk:
   *   put:
   *     summary: Upsert one mapping row (natural key customer+warehouse+material)
   *     tags: [Upload Material Location Mapping]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/UpsertMaterialLocationMappingDto' }
   *     responses:
   *       200:
   *         description: Row updated
   *       201:
   *         description: Row created
   *       401:
   *         description: Unauthorized
   *       422:
   *         description: Validation errors
   */
  @ValidatePermissions({
    allowedMenuPermissions: [
      { menuCode: cst.menuCodeUpload, action: 'CREATE' },
      { menuCode: cst.menuCodeUpload, action: 'UPDATE' },
    ],
  })
  @httpPut(
    '/bulk',
    BodyValidation(UpsertMaterialLocationMappingDto),
    UploadMaterialLocationMappingController.uploadLogging.bulk,
  )
  async upsert(
    @requestBody() dto: UpsertMaterialLocationMappingDto,
    @request() req: Request,
  ) {
    return await this.commandService.upsert(dto, req);
  }
}
