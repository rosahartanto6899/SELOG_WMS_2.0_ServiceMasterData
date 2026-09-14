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
} from 'inversify-express-utils';
import { BodyValidation, ParamValidation, QueryValidation } from '@/shared-libs/base';
import {
  ControllerLogging,
  MICROSERVICE_IDENTIFIERS,
  ValidatePermissions,
} from '@/shared-libs';
import { zoneConstant as cst } from './constants/zone.constant';
import {
  CreateZoneDto,
  ListZoneQueryDto,
  UpdateZoneDto,
  ZoneIdParamDto,
} from './dtos/zone.dto';
import { ZonesCommandService } from './zones.command.service';
import { ZonesQueryService } from './zones.query.service';

/**
 * @swagger
 * tags:
 *   - name: Zones
 *     description: Master zone CRUD (WMS master data)
 */
@controller('/v1/zones')
export class ZonesController extends BaseHttpController {
  private static readonly zonesLogging = ControllerLogging.forEntity(
    'zones',
    MICROSERVICE_IDENTIFIERS.SERVICE_ORDER,
  );

  constructor(
    @inject(ZonesQueryService) private readonly queryService: ZonesQueryService,
    @inject(ZonesCommandService)
    private readonly commandService: ZonesCommandService,
  ) {
    super();
  }

  /**
   * @swagger
   * /v1/zones:
   *   get:
   *     summary: Get all zone records (paginated, scoped by customer context)
   *     tags: [Zones]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: query
   *         name: customerCode
   *         schema: { type: string }
   *         description: Filter by customer code
   *       - in: query
   *         name: warehouseCode
   *         schema: { type: string }
   *         description: Filter by warehouse code
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Search term
   *       - in: query
   *         name: searchBy
   *         schema: { type: string, enum: [code, name] }
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
   *         schema: { type: integer, minimum: 1 }
   *         description: Number of records per page
   *     responses:
   *       200:
   *         description: Successfully retrieved zone records
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [
      { menuCode: cst.menuCode, action: 'READ' },
    ],
  })
  @httpGet('/', QueryValidation(ListZoneQueryDto), ZonesController.zonesLogging.list)
  async list(@request() req: Request) {
    return await this.queryService.list(req.query as ListZoneQueryDto, req);
  }

  /**
   * @swagger
   * /v1/zones/dropdown:
   *   get:
   *     summary: Get active zones for dropdown (customer+warehouse)
   *     tags: [Zones]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     responses:
   *       200:
   *         description: Successfully retrieved zones dropdown
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet('/dropdown', ZonesController.zonesLogging.custom('dropdown'))
  async dropdown(@request() req: Request) {
    return await this.queryService.dropdown(req.query as any, req);
  }

  /**
   * @swagger
   * /v1/zones/{id}:
   *   get:
   *     summary: Get zone record by ID
   *     tags: [Zones]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Zone record ID
   *     responses:
   *       200:
   *         description: Successfully retrieved zone record
   *       400:
   *         description: Invalid ID format or record not found
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet('/:id', ParamValidation(ZoneIdParamDto), ZonesController.zonesLogging.view)
  async detail(@request() req: Request) {
    return await this.queryService.detail((req.params as any).id);
  }

  /**
   * @swagger
   * /v1/zones:
   *   post:
   *     summary: Create a new zone record
   *     tags: [Zones]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/CreateZoneDto' }
   *     responses:
   *       201:
   *         description: Zone created successfully
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
  @httpPost('/', BodyValidation(CreateZoneDto), ZonesController.zonesLogging.create)
  async create(@request() req: Request) {
    return await this.commandService.create(req.body as CreateZoneDto, req);
  }

  /**
   * @swagger
   * /v1/zones/{id}:
   *   put:
   *     summary: Update zone record by ID (code immutable)
   *     tags: [Zones]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Zone record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/UpdateZoneDto' }
   *     responses:
   *       200:
   *         description: Zone updated successfully
   *       400:
   *         description: Invalid request payload or record not found
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
    ParamValidation(ZoneIdParamDto),
    BodyValidation(UpdateZoneDto),
    ZonesController.zonesLogging.update,
  )
  async update(@request() req: Request) {
    return await this.commandService.update(
      (req.params as any).id,
      req.body as UpdateZoneDto,
      req,
    );
  }

  /**
   * @swagger
   * /v1/zones/{id}:
   *   delete:
   *     summary: Soft delete zone record by ID (rejected if used by active location)
   *     tags: [Zones]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Zone record ID
   *     responses:
   *       200:
   *         description: Zone deleted successfully
   *       400:
   *         description: Record not found
   *       401:
   *         description: Unauthorized
   *       422:
   *         description: Zone in use by active location
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'DELETE' }],
  })
  @httpDelete('/:id', ParamValidation(ZoneIdParamDto), ZonesController.zonesLogging.delete)
  async remove(@request() req: Request) {
    return await this.commandService.delete((req.params as any).id, req);
  }
}
