import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { HTTP_STATUS } from '@/shared-libs/constants/http-status.constant';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@/shared-libs/exceptions';
import { nowWib, customerContext, userBy } from '@/utils';
import { sequelize } from '@/utils';
import { materialConstant as cst } from './constants/material.constant';
import { MaterialRepository } from './repositories/material.repository';
import { UpcaBarcodeRepository } from '@/features/v1/locations/repositories/location.repository';
import { CreateMaterialDto, UpdateMaterialDto } from './dtos/material.dto';

@injectable()
export class MaterialsCommandService {
  constructor(
    @inject(MaterialRepository)
    private readonly repository: MaterialRepository,
    @inject(UpcaBarcodeRepository)
    private readonly upcaRepository: UpcaBarcodeRepository,
  ) {}

  async create(
    dto: CreateMaterialDto,
    req: Request,
  ): Promise<{ data: null; httpCode: number }> {
    const ctx = customerContext(req);
    const user = userBy(req);

    await sequelize.transaction(async (transaction) => {
      // duplikat per customer — fix bug SP lama (cek global lintas customer)
      const dup = await this.repository.getByCode(
        ctx.customerCode,
        dto.code,
        transaction,
        true,
      );
      if (dup)
        throw new UnprocessableEntityException([
          { field: cst.key.code, message: [cst.messages.codeExists] },
        ]);

      await this.repository.create(
        {
          ...ctx,
          code: dto.code,
          name: dto.name,
          brand: dto.brand,
          barcode: dto.barcode,
          category: dto.category,
          uoM: dto.uoM ?? cst.uomDefault,
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
        'isMaterialUsed',
        user,
        transaction,
      );
    });

    return { data: null, httpCode: HTTP_STATUS.CREATED };
  }

  async update(
    id: string,
    dto: UpdateMaterialDto,
    req: Request,
  ): Promise<{ data: null; httpCode: number }> {
    const user = userBy(req);

    await sequelize.transaction(async (transaction) => {
      const material = await this.repository.getById(id, transaction);
      if (!material) throw new NotFoundException(cst.messages.notFound);

      // code & barcode immutable (paritas SP lama, kini eksplisit)
      await this.repository.update(
        id,
        {
          name: dto.name,
          category: dto.category,
          brand: dto.brand,
          uoM: dto.uoM,
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

    await sequelize.transaction(async (transaction) => {
      const material = await this.repository.getById(id, transaction);
      if (!material) throw new NotFoundException(cst.messages.notFound);

      const used = await this.repository.existsActiveMappingByMaterialId(
        id,
        transaction,
      );
      if (used)
        throw new UnprocessableEntityException([
          { field: cst.key.id, message: [cst.messages.inUseMapping] },
        ]);

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
