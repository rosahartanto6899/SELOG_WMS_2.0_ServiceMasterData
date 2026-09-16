import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { NotFoundException } from '@/shared-libs/exceptions';
import {
  customerContext,
  customerScope,
  likeTerm,
  upcaToDataUri,
  warehouseContext,
} from '@/utils';
import { locationConstant as cst } from './constants/location.constant';
import { ListLocationQueryDto, LocationDropdownQueryDto, BarcodeLabelsBodyDto } from './dtos/location.dto';
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
    // customer & warehouse diambil dari token (aktif), BUKAN query FE
    const { customerCode } = customerContext(req);
    const { warehouseCode } = warehouseContext(req);
    const where: WhereOptions = {
      ...customerScope(customerCode),
      ...(warehouseCode ? { warehouseCode } : {}),
      deletedDate: null,
      isActive: true,
    };
    if (query.zoneId) where.zoneId = query.zoneId;
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

  async dropdown(query: LocationDropdownQueryDto, req: Request) {
    // customer & warehouse diambil dari token (aktif), BUKAN query FE
    const { customerCode } = customerContext(req);
    const { warehouseCode } = warehouseContext(req);
    const data = await this.repository.findAllActive(
      customerCode,
      warehouseCode,
      query.zoneId,
    );
    return { data, httpCode: 200 };
  }

  async detail(id: string) {
    const location = await this.repository.getById(id);
    if (!location) throw new NotFoundException(cst.messages.notFound);
    const plain = location.get({ plain: true }) as any;
    plain.zoneName = plain?.zone?.name ?? null;
    delete plain.zone;
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
