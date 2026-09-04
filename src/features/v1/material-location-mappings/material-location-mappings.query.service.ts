import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { customerContext, customerScope } from '@/utils';
import { ListMappingQueryDto } from './dtos/material-location-mapping.dto';
import { MaterialLocationMappingRepository } from './repositories/material-location-mapping.repository';

@injectable()
export class MaterialLocationMappingsQueryService {
  constructor(
    @inject(MaterialLocationMappingRepository)
    private readonly repository: MaterialLocationMappingRepository,
  ) {}

  /** List mapping final — pengganti usp_GetMaterialLocationMapping. */
  async list(query: ListMappingQueryDto, req: Request) {
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

    // search menembus join (materialCode/locationName) — map ke subquery like
    if (query.search && query.searchBy) {
      if (query.searchBy === 'materialCode') {
        where['$material.code$'] = { [Op.like]: `%${query.search}%` };
      } else {
        where['$location.name$'] = { [Op.like]: `%${query.search}%` };
      }
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
      data: rows.map((r) => {
        const p = r.get({ plain: true }) as any;
        return {
          id: p.id,
          materialCode: p?.material?.code ?? null,
          materialName: p?.material?.name ?? null,
          materialBrand: p?.material?.brand ?? null,
          locationName: p?.location?.name ?? null,
          createdDate: p.createdDate,
          createdBy: p.createdBy,
          modifiedDate: p.modifiedDate,
          modifiedBy: p.modifiedBy,
        };
      }),
      httpCode: 200,
      page: {
        page,
        limit,
        totalData: count,
        totalPage: Math.ceil(count / limit),
      },
    };
  }
}
