import { inject, injectable } from 'inversify';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { HTTP_STATUS } from '@/shared-libs/constants/http-status.constant';
import { UnprocessableEntityException } from '@/shared-libs/exceptions';
import { MstLocation, MstMaterial } from '@/database/entities';
import { nowWib, customerContext, userBy } from '@/utils';
import { sequelize } from '@/utils';
import { materialLocationMappingConstant as cst } from './constants/material-location-mapping.constant';
import { UpsertMaterialLocationMappingDto } from './dtos/material-location-mapping.dto';
import { MaterialLocationMappingRepository } from './repositories/material-location-mapping.repository';

type CollectedErrors = { field: string; message: string[] }[];

/**
 * Upsert satu baris mapping — pengganti staging + SP MERGE
 * usp_InsertUpdateMaterialLocationMapping. Natural key:
 * customerCode + warehouseCode + materialId; re-upload = pindah LocationId.
 */
@injectable()
export class UploadMaterialLocationMappingCommandService {
  constructor(
    @inject(MaterialLocationMappingRepository)
    private readonly repository: MaterialLocationMappingRepository,
  ) {}

  async upsertBulk(
    dto: UpsertMaterialLocationMappingDto & { warehouseCode?: string; warehouseName?: string },
    req: Request,
  ): Promise<{ data: null; httpCode: number }> {
    const ctx = customerContext(req);
    const user = userBy(req);
    let isCreate = true;

    await sequelize.transaction(async (transaction: Transaction) => {
      const allErrors: CollectedErrors = [];

      // match material per customer (fix bug lama: global by code tanpa customer)
      const material = await MstMaterial.findOne({
        where: {
          customerCode: ctx.customerCode,
          code: dto.materialCode,
          isActive: true,
          deletedDate: null,
        },
        transaction,
      });
      if (!material)
        allErrors.push({
          field: cst.key.materialCode,
          message: [cst.messages.materialNotFound],
        });

      // match location per warehouse (paritas lama: Name + WarehouseCode)
      const location = await MstLocation.findOne({
        where: {
          warehouseCode: dto.warehouseCode,
          name: dto.locationName,
          isActive: true,
          deletedDate: null,
        },
        transaction,
      });
      if (!location)
        allErrors.push({
          field: cst.key.locationName,
          message: [cst.messages.locationNotFound],
        });

      if (allErrors.length) throw new UnprocessableEntityException(allErrors);

      const materialId = material!.get('id') as string;
      const locationPlain = location!.get({ plain: true }) as any;

      const existing = await this.repository.getByNaturalKey(
        ctx.customerCode,
        dto.warehouseCode!,
        materialId,
        transaction,
        true,
      );

      if (existing) {
        isCreate = false;
        await this.repository.update(
          existing.get('id') as string,
          {
            locationId: locationPlain.id,
            modifiedDate: nowWib(),
            modifiedBy: user,
          },
          transaction,
        );
      } else {
        await this.repository.create(
          {
            customerCode: ctx.customerCode,
            customerName: ctx.customerName,
            warehouseCode: dto.warehouseCode!,
            warehouseName: dto.warehouseName ?? locationPlain.warehouseName ?? '-',
            materialId,
            locationId: locationPlain.id,
            isActive: true,
            createdDate: nowWib(),
            createdBy: user,
          },
          transaction,
        );
      }
    });

    return {
      data: null,
      httpCode: isCreate ? HTTP_STATUS.CREATED : HTTP_STATUS.OK,
    };
  }
}
