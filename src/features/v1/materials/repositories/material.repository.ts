import { injectable } from 'inversify';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import {
  MstMaterial,
  MstMaterialLocationMapping,
} from '@/database/entities';
import { customerScope } from '@/utils';
import { MstMaterialAttributes } from '@/database/attributes';

@injectable()
export class MaterialRepository {
  public async findAndCountAll(
    where: WhereOptions,
    order: [string, string][],
    offset: number,
    limit: number,
  ) {
    return MstMaterial.findAndCountAll({ where, order, offset, limit });
  }

  public async findAllActive(
    customerCode: string | undefined,
  ): Promise<MstMaterialAttributes[]> {
    const results = await MstMaterial.findAll({
      where: { ...customerScope(customerCode), isActive: true, deletedDate: null },
      order: [['code', 'ASC']],
      attributes: ['id', 'code', 'name', 'brand'],
    });
    return results.map((r) => r.get({ plain: true }));
  }

  public async getById(id: string, transaction?: Transaction) {
    return MstMaterial.findOne({ where: { id, deletedDate: null }, transaction });
  }

  public async getByCode(
    customerCode: string | undefined,
    code: string,
    transaction?: Transaction,
    lock = false,
  ) {
    const options: FindOptions = {
      where: { ...customerScope(customerCode), code, deletedDate: null },
      transaction,
      ...(lock && transaction ? { lock } : {}),
    };
    return MstMaterial.findOne(options);
  }

  public async existsActiveMappingByMaterialId(
    materialId: string,
    transaction?: Transaction,
  ) {
    const count = await MstMaterialLocationMapping.count({
      where: { materialId, isActive: true, deletedDate: null },
      transaction,
    });
    return count > 0;
  }

  public async create(
    data: MstMaterialAttributes,
    transaction?: Transaction,
  ) {
    return MstMaterial.create(data, { transaction });
  }

  public async update(
    id: string,
    data: Partial<MstMaterialAttributes>,
    transaction?: Transaction,
  ) {
    await MstMaterial.update(data, { where: { id }, transaction });
  }
}
