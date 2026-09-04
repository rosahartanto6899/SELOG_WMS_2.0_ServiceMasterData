import { DataTypes, ModelDefined, Optional } from 'sequelize';
import { sequelize } from '@/utils/database.util';
import { MstMaterialLocationMappingAttributes } from '@/database/attributes';

type Creation = Optional<
  MstMaterialLocationMappingAttributes,
  | 'id'
  | 'isActive'
  | 'createdDate'
  | 'createdBy'
  | 'modifiedDate'
  | 'modifiedBy'
  | 'deletedBy'
  | 'deletedDate'
>;

const tableName = 'MstMaterialLocationMapping';

const MstMaterialLocationMapping: ModelDefined<
  MstMaterialLocationMappingAttributes,
  Creation
> = sequelize.define(
  tableName,
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerCode: { type: DataTypes.STRING(50), allowNull: false },
    customerName: { type: DataTypes.STRING(75), allowNull: false },
    warehouseCode: { type: DataTypes.STRING(50), allowNull: false },
    warehouseName: { type: DataTypes.STRING(75), allowNull: false },
    materialId: { type: DataTypes.UUID, allowNull: true },
    locationId: { type: DataTypes.UUID, allowNull: true },
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
      {
        name: 'idx_mst_mapping_customer_warehouse_material',
        fields: ['customerCode', 'warehouseCode', 'materialId'],
      },
    ],
  },
);

export { MstMaterialLocationMapping };
