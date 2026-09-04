import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { customerContext, customerScope } from '@/utils';
import { upcaToDataUri } from '@/utils';
import { ListLocationQueryDto, BarcodeLabelsBodyDto } from './dtos/location.dto';
import {
  LocationRepository,
  UpcaBarcodeRepository,
} from './repositories/location.repository';

@injectable()
export class LocationsQueryService {
  constructor(
    @inject(LocationRepository)
    private readonly repository: LocationRepository,
    @inject(UpcaBarcodeRepository)
    private readonly upcaRepository: UpcaBarcodeRepository,
  ) {}

  async list(query: ListLocationQueryDto, req: Request) {
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
    if (query.zoneId) where.zoneId = query.zoneId;
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
      data: rows.map((r) => {
        const plain = r.get({ plain: true }) as any;
        plain.zoneName = plain?.zone?.name ?? null;
        delete plain.zone;
        return plain;
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

  async dropdown(
    query: { customerCode?: string; warehouseCode?: string; zoneId?: string },
    req: Request,
  ) {
    const { customerCode } = customerContext(req);
    const data = await this.repository.findAllActive(
      query.customerCode ?? customerCode,
      query.warehouseCode ?? '',
      query.zoneId,
    );
    return { data, httpCode: 200 };
  }

  async detail(id: string) {
    const location = await this.repository.getById(id);
    const plain = location ? (location.get({ plain: true }) as any) : null;
    if (plain) {
      plain.zoneName = plain?.zone?.name ?? null;
      delete plain.zone;
    }
    return { data: plain, httpCode: 200 };
  }

  async availableBarcodes() {
    const data = await this.upcaRepository.findAvailable('isLocationUsed');
    return { data, httpCode: 200 };
  }

  /** Render label barcode UPCA (SVG data-uri) — paritas GenerateBarcodeLocationPrint lama. */
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
