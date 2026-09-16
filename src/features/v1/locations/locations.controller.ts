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
import { locationConstant as cst } from './constants/location.constant';
import {
  BarcodeLabelsBodyDto,
  CreateLocationDto,
  ListLocationQueryDto,
  LocationDropdownQueryDto,
  LocationIdParamDto,
  UpdateLocationDto,
} from './dtos/location.dto';
import { LocationsCommandService } from './locations.command.service';
import { LocationsQueryService } from './locations.query.service';

/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: Master location CRUD + UPCA barcode pool & label print
 */
@controller('/v1/locations')
export class LocationsController extends BaseHttpController {
  private static readonly locationsLogging = ControllerLogging.forEntity(
    'locations',
    MICROSERVICE_IDENTIFIERS.SERVICE_MASTER_DATA,
  );

  constructor(
    @inject(LocationsQueryService)
    private readonly queryService: LocationsQueryService,
    @inject(LocationsCommandService)
    private readonly commandService: LocationsCommandService,
  ) {
    super();
  }

  /**
   * @swagger
   * /v1/locations:
   *   get:
   *     summary: Get all location records (paginated, scoped by token customer & active warehouse)
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: query
   *         name: zoneId
   *         schema: { type: string, format: uuid }
   *         description: Filter by zone ID
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Search term
   *       - in: query
   *         name: searchBy
   *         schema: { type: string, enum: [code, name, category, description] }
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
   *         description: Successfully retrieved location records
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet('/', QueryValidation(ListLocationQueryDto), LocationsController.locationsLogging.list)
  async list(@request() req: Request) {
    return await this.queryService.list(queryDto<ListLocationQueryDto>(req), req);
  }

  /**
   * @swagger
   * /v1/locations/dropdown:
   *   get:
   *     summary: Get locations for dropdown
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     responses:
   *       200:
   *         description: Successfully retrieved locations dropdown
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet(
    '/dropdown',
    QueryValidation(LocationDropdownQueryDto),
    LocationsController.locationsLogging.dropdown,
  )
  async dropdown(@request() req: Request) {
    return await this.queryService.dropdown(queryDto<LocationDropdownQueryDto>(req), req);
  }

  /**
   * @swagger
   * /v1/locations/available-barcodes:
   *   get:
   *     summary: Get available UPCA barcodes from the pool (up to 200)
   *     tags: [Locations]
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
    LocationsController.locationsLogging.custom('available-barcodes'),
  )
  async availableBarcodes() {
    return await this.queryService.availableBarcodes();
  }

  /**
   * @swagger
   * /v1/locations/barcode-labels:
   *   post:
   *     summary: Render UPCA barcode labels (SVG data-uri) for printing
   *     tags: [Locations]
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
    LocationsController.locationsLogging.custom('barcode-labels'),
  )
  async barcodeLabels(@requestBody() body: BarcodeLabelsBodyDto) {
    return await this.queryService.barcodeLabels(body);
  }

  /**
   * @swagger
   * /v1/locations/{id}:
   *   get:
   *     summary: Get location record by ID
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Location record ID
   *     responses:
   *       200:
   *         description: Successfully retrieved location record
   *       404:
   *         description: Location record not found
   *       401:
   *         description: Unauthorized
   */
  @ValidatePermissions({
    allowedMenuPermissions: [{ menuCode: cst.menuCode, action: 'READ' }],
  })
  @httpGet(
    '/:id',
    ParamValidation(LocationIdParamDto),
    LocationsController.locationsLogging.view,
  )
  async detail(@requestParam('id') id: string) {
    return await this.queryService.detail(id);
  }

  /**
   * @swagger
   * /v1/locations:
   *   post:
   *     summary: Create a new location record
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/CreateLocationDto' }
   *     responses:
   *       201:
   *         description: Location created successfully
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
    BodyValidation(CreateLocationDto),
    LocationsController.locationsLogging.create,
  )
  async create(@requestBody() dto: CreateLocationDto, @request() req: Request) {
    return await this.commandService.create(dto, req);
  }

  /**
   * @swagger
   * /v1/locations/{id}:
   *   put:
   *     summary: Update location record by ID (code immutable; optional fields omitted are unchanged)
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Location record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/UpdateLocationDto' }
   *     responses:
   *       200:
   *         description: Location updated successfully
   *       404:
   *         description: Location record not found
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
    ParamValidation(LocationIdParamDto),
    BodyValidation(UpdateLocationDto),
    LocationsController.locationsLogging.update,
  )
  async update(
    @requestParam('id') id: string,
    @requestBody() dto: UpdateLocationDto,
    @request() req: Request,
  ) {
    return await this.commandService.update(id, dto, req);
  }

  /**
   * @swagger
   * /v1/locations/{id}:
   *   delete:
   *     summary: Soft delete location record by ID
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *       - api_key: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *         description: Location record ID
   *     responses:
   *       200:
   *         description: Location deleted successfully
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
    ParamValidation(LocationIdParamDto),
    LocationsController.locationsLogging.delete,
  )
  async remove(@requestParam('id') id: string, @request() req: Request) {
    return await this.commandService.delete(id, req);
  }
}
