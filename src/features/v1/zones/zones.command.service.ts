import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { HTTP_STATUS } from '@/shared-libs/constants/http-status.constant';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@/shared-libs/exceptions';
import { nowWib, customerContext, userBy, warehouseContext } from '@/utils';
import { sequelize } from '@/utils';
import { zoneConstant as cst } from './constants/zone.constant';
import { ZoneRepository } from './repositories/zone.repository';
import { CreateZoneDto, UpdateZoneDto } from './dtos/zone.dto';

type CollectedErrors = { field: string; message: string[] }[];

@injectable()
export class ZonesCommandService {
  constructor(
    @inject(ZoneRepository) private readonly repository: ZoneRepository,
  ) {}

  async create(dto: CreateZoneDto, req: Request): Promise<{ data: null; httpCode: number }> {
    const ctx = customerContext(req);
    const user = userBy(req);
    const { warehouseCode, warehouseName } = warehouseContext(req);
    // zone milik gudang — tanpa konteks warehouse aktif, row jadi sampah
    if (!warehouseCode) {
      throw new BadRequestException('Active warehouse context is required (Switch Warehouse)');
    }

    await sequelize.transaction(async (transaction: Transaction) => {
      const existing = await this.repository.findByCode(
        ctx.customerCode,
        warehouseCode,
        dto.code,
        transaction,
        true,
      );
      if (existing) {
        throw new UnprocessableEntityException([
          { field: cst.key.code, message: [cst.messages.codeExists] },
        ]);
      }
      await this.repository.create(
        {
          ...ctx,
          warehouseCode,
          warehouseName,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          isActive: true,
          createdDate: nowWib(),
          createdBy: user,
        },
        transaction,
      );
    });

    return { data: null, httpCode: HTTP_STATUS.CREATED };
  }

  async update(
    id: string,
    dto: UpdateZoneDto,
    req: Request,
  ): Promise<{ data: null; httpCode: number }> {
    const user = userBy(req);

    await sequelize.transaction(async (transaction: Transaction) => {
      const zone = await this.repository.getById(id, transaction);
      if (!zone) throw new NotFoundException(cst.messages.notFound);
      await this.repository.update(
        id,
        {
          name: dto.name,
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
    const errors: CollectedErrors = [];

    await sequelize.transaction(async (transaction: Transaction) => {
      const zone = await this.repository.getById(id, transaction);
      if (!zone) throw new NotFoundException(cst.messages.notFound);

      const used = await this.repository.existsActiveLocationByZoneId(
        id,
        transaction,
      );
      if (used) {
        errors.push({
          field: cst.key.id,
          message: [cst.messages.inUseLocation],
        });
      }
      if (errors.length) throw new UnprocessableEntityException(errors);

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
