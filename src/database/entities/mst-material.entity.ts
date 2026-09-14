import { DataTypes, ModelDefined, Optional } from 'sequelize';
import { sequelize } from '@/utils/database.util';
import { MstMaterialAttributes } from '@/database/attributes';

type Creation = Optional<
  MstMaterialAttributes,
  | 'id'
  | 'isActive'
  | 'createdDate'
  | 'createdBy'
  | 'modifiedDate'
  | 'modifiedBy'
  | 'deletedBy'
  | 'deletedDate'
>;

const tableName = 'MstMaterial';

const MstMaterial: ModelDefined<MstMaterialAttributes, Creation> =
  sequelize.define(
    tableName,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customerCode: { type: DataTypes.STRING(50), allowNull: true },
      customerName: { type: DataTypes.STRING(75), allowNull: true },
      code: { type: DataTypes.STRING(100), allowNull: true },
      name: { type: DataTypes.STRING(200), allowNull: true },
      brand: { type: DataTypes.STRING(100), allowNull: true },
      barcode: { type: DataTypes.STRING(12), allowNull: true },
      description: { type: DataTypes.STRING(200), allowNull: true },
      category: { type: DataTypes.STRING(50), allowNull: false },
      uoM: { type: DataTypes.STRING(20), allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdDate: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(75), allowNull: false },
      modifiedDate: { type: DataTypes.DATE, allowNull: true },
      modifiedBy: { type: DataTypes.STRING(75), allowNull: true },
      deletedBy: { type: DataTypes.STRING(100), allowNull: true },
      deletedDate: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName,
      timestamps: false,
      indexes: [
        { name: 'idx_mst_material_customer_code', fields: ['customerCode', 'code'] },
      ],
    },
  );

export { MstMaterial };
