import { injectable } from 'inversify';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';
import { customerScope } from '@/utils';
import {
  MstLocation,
  MstMaterialLocationMapping,
  MstUpcaBarcode,
} from '@/database/entities';
import { MstLocationAttributes } from '@/database/attributes';

@injectable()
export class LocationRepository {
  public async findAndCountAll(
    where: WhereOptions,
    order: [string, string][],
    offset: number,
    limit: number,
  ) {
    return MstLocation.findAndCountAll({
      where,
      order,
      offset,
      limit,
      include: [
        {
          association: 'zone',
          attributes: ['id', 'code', 'name'],
          required: false, // LEFT JOIN — zone non-aktif tidak menyembunyikan location
        },
      ],
    });
  }

  public async findAllActive(
    customerCode: string | undefined,
    warehouseCode: string,
    zoneId?: string,
  ): Promise<MstLocationAttributes[]> {
    const where: WhereOptions = {
      ...customerScope(customerCode),
      warehouseCode,
      isActive: true,
      deletedDate: null,
    };
    if (zoneId) where.zoneId = zoneId;
    const results = await MstLocation.findAll({
      where,
      order: [['code', 'ASC']],
      attributes: ['id', 'code', 'name'],
    });
    return results.map((r) => r.get({ plain: true }));
  }

  public async getById(id: string, transaction?: Transaction) {
    return MstLocation.findOne({
      where: { id, deletedDate: null },
      transaction,
      include: [{ association: 'zone', attributes: ['id', 'code', 'name'], required: false }],
    });
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
    return MstLocation.findOne(options);
  }

  public async existsActiveMappingByLocationId(
    locationId: string,
    transaction?: Transaction,
  ) {
    const count = await MstMaterialLocationMapping.count({
      where: { locationId, isActive: true, deletedDate: null },
      transaction,
    });
    return count > 0;
  }

  public async create(
    data: MstLocationAttributes,
    transaction?: Transaction,
  ) {
    return MstLocation.create(data, { transaction });
  }

  public async update(
    id: string,
    data: Partial<MstLocationAttributes>,
    transaction?: Transaction,
  ) {
    await MstLocation.update(data, { where: { id }, transaction });
  }
}

/** Pool barcode UPCA (MstUPCABarcode) — dipakai locations & materials. */
@injectable()
export class UpcaBarcodeRepository {
  public async findAvailable(
    usedFlag: 'isLocationUsed' | 'isMaterialUsed',
    limit = 200,
  ) {
    const where: WhereOptions = { barcode: { [Op.ne]: null } };
    where[usedFlag] = null;
    const results = await MstUpcaBarcode.findAll({
      where,
      order: [['barcode', 'ASC']],
      limit,
      attributes: ['id', 'barcode'],
    });
    return results.map((r) => r.get({ plain: true }));
  }

  public async markUsed(
    barcode: string,
    usedFlag: 'isLocationUsed' | 'isMaterialUsed',
    modifiedBy: string,
    transaction?: Transaction,
  ) {
    await MstUpcaBarcode.update(
      { [usedFlag]: true, modifiedBy, modifiedDate: new Date() },
      { where: { barcode }, transaction },
    );
  }
}
