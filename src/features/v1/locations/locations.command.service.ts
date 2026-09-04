import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { HTTP_STATUS } from '@/shared-libs/constants/http-status.constant';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@/shared-libs/exceptions';
import { MstZone } from '@/database/entities';
import { nowWib, customerContext, userBy } from '@/utils';
import { sequelize } from '@/utils';
import { locationConstant as cst } from './constants/location.constant';
import {
  LocationRepository,
  UpcaBarcodeRepository,
} from './repositories/location.repository';
import { CreateLocationDto, UpdateLocationDto } from './dtos/location.dto';

@injectable()
export class LocationsCommandService {
  constructor(
    @inject(LocationRepository)
    private readonly repository: LocationRepository,
    @inject(UpcaBarcodeRepository)
    private readonly upcaRepository: UpcaBarcodeRepository,
  ) {}

  async create(
    dto: CreateLocationDto,
    req: Request,
  ): Promise<{ data: null; httpCode: number }> {
    const ctx = customerContext(req);
    const user = userBy(req);

    await sequelize.transaction(async (transaction: Transaction) => {
      const errors = [];
      const dup = await this.repository.findByCode(
        ctx.customerCode,
        dto.warehouseCode,
        dto.code,
        transaction,
        true,
      );
      if (dup)
        errors.push({ field: cst.key.code, message: [cst.messages.codeExists] });

      const zone = await MstZone.findOne({
        where: { id: dto.zoneId, isActive: true, deletedDate: null },
        transaction,
      });
      if (!zone)
        errors.push({ field: cst.key.zoneId, message: [cst.messages.zoneNotFound] });

      if (errors.length) throw new UnprocessableEntityException(errors);

      await this.repository.create(
        {
          ...ctx,
          warehouseCode: dto.warehouseCode,
          warehouseName:
            dto.warehouseName ??
            (zone.get({ plain: true }) as any)?.warehouseName ??
            '-',
          code: dto.code,
          name: dto.name,
          barcode: dto.barcode,
          category: dto.category ?? cst.categories[0],
          zoneId: dto.zoneId,
          description: dto.description,
          isActive: true,
          createdDate: nowWib(),
          createdBy: user,
        },
        transaction,
      );

      // paritas SP lama: tandai barcode terpakai di pool UPCA
      await this.upcaRepository.markUsed(
        dto.barcode,
        'isLocationUsed',
        user,
        transaction,
      );
    });

    return { data: null, httpCode: HTTP_STATUS.CREATED };
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
    req: Request,
  ): Promise<{ data: null; httpCode: number }> {
    const user = userBy(req);

    await sequelize.transaction(async (transaction: Transaction) => {
      const location = await this.repository.getById(id, transaction);
      if (!location) throw new NotFoundException(cst.messages.notFound);

      const zone = await MstZone.findOne({
        where: { id: dto.zoneId, isActive: true, deletedDate: null },
        transaction,
      });
      if (!zone)
        throw new UnprocessableEntityException([
          { field: cst.key.zoneId, message: [cst.messages.zoneNotFound] },
        ]);

      // code & barcode immutable (paritas SP lama, kini eksplisit)
      await this.repository.update(
        id,
        {
          name: dto.name,
          category: dto.category,
          zoneId: dto.zoneId,
          description: dto.description,
          modifiedDate: nowWib(),
          modifiedBy: user,
        },
        transaction,
      );
    });

    return { data: null, httpCode: HTTP_STATUS.OK };
  }

  async delete(id: string, req: Request): Promise<{ data: null; httpCode: number }> {
    const user = userBy(req);

    await sequelize.transaction(async (transaction: Transaction) => {
      const location = await this.repository.getById(id, transaction);
      if (!location) throw new NotFoundException(cst.messages.notFound);

      const used = await this.repository.existsActiveMappingByLocationId(
        id,
        transaction,
      );
      if (used)
        throw new UnprocessableEntityException([
          { field: cst.key.id, message: [cst.messages.inUseMapping] },
        ]);

      // ponytail: flag IsLocationUsed TIDAK di-release (paritas lama); release bila bisnis minta
      await this.repository.update(
        id,
        {
          isActive: false,
          deletedDate: nowWib(),
          deletedBy: user,
          modifiedDate: nowWib(),
          modifiedBy: user,
        },
        transaction,
      );
    });

    return { data: null, httpCode: HTTP_STATUS.OK };
  }
}
