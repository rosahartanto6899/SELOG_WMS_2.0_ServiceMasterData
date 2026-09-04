import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { customerContext, customerScope } from '@/utils';
import { ListZoneQueryDto } from './dtos/zone.dto';
import { ZoneRepository } from './repositories/zone.repository';

@injectable()
export class ZonesQueryService {
  constructor(
    @inject(ZoneRepository) private readonly repository: ZoneRepository,
  ) {}

  async list(query: ListZoneQueryDto, req: Request) {
    const { customerCode } = customerContext(req);
    const where: WhereOptions = {
      ...customerScope(query.customerCode ?? customerCode),
      deletedDate: null,
      isActive: true,
    };
    if (query.warehouseCode)
      where.warehouseCode = {
        [Op.in]: query.warehouseCode.split(',').filter(Boolean),
      };
    if (query.search && query.searchBy) {
      where[query.searchBy] = { [Op.like]: `%${query.search}%` };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order: [string, string] = [
      query.order ?? 'code',
      (query.sort ?? 'asc') as 'asc' | 'desc',
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

  async dropdown(
    query: { customerCode?: string; warehouseCode?: string },
    req: Request,
  ) {
    const { customerCode } = customerContext(req);
    const data = await this.repository.findAllActive(
      query.customerCode ?? customerCode,
      query.warehouseCode ?? '',
    );
    return { data, httpCode: 200 };
  }

  async detail(id: string) {
    const zone = await this.repository.getById(id);
    return { data: zone ? zone.get({ plain: true }) : null, httpCode: 200 };
  }
}
