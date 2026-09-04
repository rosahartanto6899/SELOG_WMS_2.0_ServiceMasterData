import { injectable } from 'inversify';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { customerScope } from '@/utils';
import { MstLocation, MstZone } from '@/database/entities';
import { MstZoneAttributes } from '@/database/attributes';

@injectable()
export class ZoneRepository {
  public async findAndCountAll(
    where: WhereOptions,
    order: [string, string][],
    offset: number,
    limit: number,
  ) {
    return MstZone.findAndCountAll({ where, order, offset, limit });
  }

  public async findAllActive(
    customerCode: string | undefined,
    warehouseCode: string,
  ): Promise<MstZoneAttributes[]> {
    const results = await MstZone.findAll({
      where: {
        ...customerScope(customerCode),
        warehouseCode,
        isActive: true,
        deletedDate: null,
      },
      order: [['code', 'ASC']],
      attributes: ['id', 'code', 'name'],
    });
    return results.map((r) => r.get({ plain: true }));
  }

  public async getById(id: string, transaction?: Transaction) {
    return MstZone.findOne({ where: { id, deletedDate: null }, transaction });
  }

  public async findByCode(
    customerCode: string | undefined,
    warehouseCode: string,
    code: string,
    transaction?: Transaction,
    lock = false,
  ) {
    const options: FindOptions = {
      where: { ...customerScope(customerCode), warehouseCode, code, deletedDate: null },
      transaction,
      ...(lock && transaction ? { lock } : {}),
    };
    return MstZone.findOne(options);
  }

  public async existsActiveLocationByZoneId(
    zoneId: string,
    transaction?: Transaction,
  ) {
    const count = await MstLocation.count({
      where: { zoneId, isActive: true, deletedDate: null },
      transaction,
    });
    return count > 0;
  }

  public async create(data: MstZoneAttributes, transaction?: Transaction) {
    return MstZone.create(data, { transaction });
  }

  public async update(
    id: string,
    data: Partial<MstZoneAttributes>,
    transaction?: Transaction,
  ) {
    await MstZone.update(data, { where: { id }, transaction });
  }
}
