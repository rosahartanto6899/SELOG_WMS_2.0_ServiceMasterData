import { DataTypes, ModelDefined, Optional } from 'sequelize';
import { sequelize } from '@/utils/database.util';
import { MstUoMAttributes } from '@/database/attributes';

type Creation = Optional<
  MstUoMAttributes,
  | 'id'
  | 'description'
  | 'createdDate'
  | 'createdBy'
  | 'modifiedDate'
  | 'modifiedBy'
  | 'deletedBy'
  | 'deletedDate'
>;

const tableName = 'MstUoM';

const MstUoM: ModelDefined<MstUoMAttributes, Creation> = sequelize.define(
  tableName,
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    uoM: { type: DataTypes.STRING(20), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(200), allowNull: true },
    ordinal: { type: DataTypes.INTEGER, allowNull: true },
    createdDate: { type: DataTypes.DATE, allowNull: false },
    createdBy: { type: DataTypes.STRING(75), allowNull: true },
    modifiedDate: { type: DataTypes.DATE, allowNull: true },
    modifiedBy: { type: DataTypes.STRING(75), allowNull: true },
    deletedBy: { type: DataTypes.STRING(100), allowNull: true },
    deletedDate: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName,
    timestamps: false,
  },
);

export { MstUoM };
