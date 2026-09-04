import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { customerContext, customerScope, upcaToDataUri } from '@/utils';
import { MaterialRepository } from './repositories/material.repository';
import { UpcaBarcodeRepository } from '@/features/v1/locations/repositories/location.repository';
import { BarcodeLabelsBodyDto } from '@/features/v1/locations/dtos/location.dto';
import { ListMaterialQueryDto } from './dtos/material.dto';

@injectable()
export class MaterialsQueryService {
  constructor(
    @inject(MaterialRepository)
    private readonly repository: MaterialRepository,
    @inject(UpcaBarcodeRepository)
    private readonly upcaRepository: UpcaBarcodeRepository,
  ) {}

  async list(query: ListMaterialQueryDto, req: Request) {
    const { customerCode } = customerContext(req);
    const where: WhereOptions = {
      ...customerScope(query.customerCode ?? customerCode),
      deletedDate: null,
      isActive: true,
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

  async dropdown(query: { customerCode?: string }, req: Request) {
    const { customerCode } = customerContext(req);
    const data = await this.repository.findAllActive(
      query.customerCode ?? customerCode,
    );
    return { data, httpCode: 200 };
  }

  async detail(id: string) {
    const material = await this.repository.getById(id);
    return {
      data: material ? material.get({ plain: true }) : null,
      httpCode: 200,
    };
  }

  async availableBarcodes() {
    const data = await this.upcaRepository.findAvailable('isMaterialUsed');
    return { data, httpCode: 200 };
  }

  /** Render label barcode UPCA (SVG data-uri) — paritas GenerateBarcodePrint lama. */
  async barcodeLabels(body: BarcodeLabelsBodyDto) {
    const data = (body.items ?? [])
      .filter((i) => /^\d{11,12}$/.test(i.barcode))
      .map((i) => ({
        barcode: i.barcode,
        code: i.code ?? i.barcode,
        name: i.name ?? '',
        image: upcaToDataUri(i.barcode),
      }));
    return { data, httpCode: 200 };
  }
}
