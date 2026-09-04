import { injectable } from 'inversify';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { customerScope } from '@/utils';
import { MstMaterialLocationMapping } from '@/database/entities';
import { MstMaterialLocationMappingAttributes } from '@/database/attributes';

@injectable()
export class MaterialLocationMappingRepository {
  public async findAndCountAll(
    where: WhereOptions,
    order: [string, string][],
    offset: number,
    limit: number,
  ) {
    return MstMaterialLocationMapping.findAndCountAll({
      where,
      order,
      offset,
      limit,
      include: [
        {
          association: 'material',
          attributes: ['id', 'code', 'name', 'brand'],
          required: true, // INNER JOIN — mapping tanpa material = data sampah
        },
        {
          association: 'location',
          attributes: ['id', 'code', 'name'],
          required: false, // LEFT JOIN — location boleh terhapus soft
        },
      ],
    });
  }

  /** Natural key lama (MERGE SP): customerCode + warehouseCode + materialId. */
  public async getByNaturalKey(
    customerCode: string | undefined,
    warehouseCode: string,
    materialId: string,
    transaction?: Transaction,
    lock = false,
  ) {
    const options: FindOptions = {
      where: {
        ...customerScope(customerCode),
        warehouseCode,
        materialId,
        deletedDate: null,
      },
      transaction,
      ...(lock && transaction ? { lock } : {}),
    };
    return MstMaterialLocationMapping.findOne(options);
  }

  public async create(
    data: MstMaterialLocationMappingAttributes,
    transaction?: Transaction,
  ) {
    return MstMaterialLocationMapping.create(data, { transaction });
  }

  public async update(
    id: string,
    data: Partial<MstMaterialLocationMappingAttributes>,
    transaction?: Transaction,
  ) {
    await MstMaterialLocationMapping.update(data, {
      where: { id },
      transaction,
    });
  }
}
