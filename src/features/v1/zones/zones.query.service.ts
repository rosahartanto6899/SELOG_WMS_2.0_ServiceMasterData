import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { NotFoundException } from '@/shared-libs/exceptions';
import {
  customerContext,
  customerScope,
  likeTerm,
  scopedCustomerCode,
  warehouseContext,
} from '@/utils';
import { zoneConstant as cst } from './constants/zone.constant';
import { ListZoneQueryDto } from './dtos/zone.dto';
import { ZoneRepository } from './repositories/zone.repository';

@injectable()
export class ZonesQueryService {
  constructor(
    @inject(ZoneRepository) private readonly repository: ZoneRepository,
  ) {}

  async list(query: ListZoneQueryDto, req: Request) {
    // scope customer: klaim token MENANG; admin tanpa klaim boleh pakai query param.
    // Warehouse tetap murni dari token (aktif), BUKAN query FE.
    const { warehouseCode } = warehouseContext(req);
    const where: WhereOptions = {
      ...customerScope(scopedCustomerCode(req, query.customerCode)),
      ...(warehouseCode ? { warehouseCode } : {}),
      deletedDate: null,
      isActive: true,
    };
    if (query.search && query.searchBy) {
      Object.assign(where, { [query.searchBy]: { [Op.like]: likeTerm(query.search) } });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order: [string, string] = [
      query.order ?? 'createdDate',
      (query.sort ?? 'desc') as 'asc' | 'desc',
    ];

    const { rows, count } = await this.repository.findAndCountAll(
      where,
      [order],
      (page - 1) * limit,
      limit,
    );

    return {
      data: rows.map((r) => r.get({ plain: true })),
      httpCode: 200,
      page: {
        page,
        limit,
        totalData: count,
        totalPage: Math.ceil(count / limit),
      },
    };
  }

  async dropdown(req: Request) {
    // scope murni dari token aktif (Switch Warehouse) — bukan dari query param
    const { customerCode } = customerContext(req);
    const { warehouseCode } = warehouseContext(req);
    const data = await this.repository.findAllActive(
      customerCode,
      warehouseCode,
    );
    return { data, httpCode: 200 };
  }

  async detail(id: string) {
    const zone = await this.repository.getById(id);
    if (!zone) throw new NotFoundException(cst.messages.notFound);
    return { data: zone.get({ plain: true }), httpCode: 200 };
  }
}
