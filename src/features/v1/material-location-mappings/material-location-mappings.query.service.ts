import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, OrderItem, WhereOptions } from 'sequelize';
import { customerScope, likeTerm, scopedCustomerCode, warehouseContext } from '@/utils';
import { MstMaterial } from '@/database/entities';
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
    // scope customer: klaim token MENANG; admin tanpa klaim boleh pakai query param.
    // Warehouse tetap murni dari token (aktif), BUKAN query FE.
    const { warehouseCode } = warehouseContext(req);
    const where: WhereOptions = {
      ...customerScope(scopedCustomerCode(req, query.customerCode)),
      ...(warehouseCode ? { warehouseCode } : {}),
      deletedDate: null,
      isActive: true,
    };

    // search menembus join (materialCode/locationName) — map ke subquery like
    if (query.search && query.searchBy) {
      if (query.searchBy === 'materialCode') {
        where['$material.code$'] = { [Op.like]: likeTerm(query.search) };
      } else {
        where['$location.name$'] = { [Op.like]: likeTerm(query.search) };
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    // materialCode = kolom join material — string path '$material.code$' hanya valid di
    // WHERE, untuk ORDER wajib bentuk object [{ model, as }, 'code'] (kolom tabel mapping tidak ada)
    const order: OrderItem[] =
      query.order === 'materialCode'
        ? [[{ model: MstMaterial, as: 'material' }, 'code', (query.sort ?? 'desc') as 'asc' | 'desc']]
        : [[query.order ?? 'createdDate', (query.sort ?? 'desc') as 'asc' | 'desc']];

    const { rows, count } = await this.repository.findAndCountAll(
      where,
      order,
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
