import { DataTypes, ModelDefined, Optional } from 'sequelize';
import { sequelize } from '@/utils/database.util';
import { MstZoneAttributes } from '@/database/attributes';

type Creation = Optional<
  MstZoneAttributes,
  | 'id'
  | 'isActive'
  | 'createdDate'
  | 'createdBy'
  | 'modifiedDate'
  | 'modifiedBy'
  | 'deletedBy'
  | 'deletedDate'
>;

const tableName = 'MstZone';

const MstZone: ModelDefined<MstZoneAttributes, Creation> = sequelize.define(
  tableName,
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerCode: { type: DataTypes.STRING(50), allowNull: true },
    customerName: { type: DataTypes.STRING(75), allowNull: true },
    warehouseCode: { type: DataTypes.STRING(50), allowNull: true },
    warehouseName: { type: DataTypes.STRING(75), allowNull: true },
    code: { type: DataTypes.STRING(50), allowNull: true },
    name: { type: DataTypes.STRING(75), allowNull: true },
    description: { type: DataTypes.STRING(200), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    createdDate: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.STRING(75), allowNull: true },
    modifiedDate: { type: DataTypes.DATE, allowNull: true },
    modifiedBy: { type: DataTypes.STRING(75), allowNull: true },
    deletedBy: { type: DataTypes.STRING(100), allowNull: true },
    deletedDate: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName,
    timestamps: false,
    indexes: [
      { name: 'idx_mst_zone_customer_warehouse', fields: ['customerCode', 'warehouseCode'] },
      { name: 'idx_mst_zone_code', fields: ['code'] },
    ],
  },
);

export { MstZone };
