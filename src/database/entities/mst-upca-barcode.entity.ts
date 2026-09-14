import { DataTypes, ModelDefined, Optional } from 'sequelize';
import { sequelize } from '@/utils/database.util';
import { MstUpcaBarcodeAttributes } from '@/database/attributes';

type Creation = Optional<MstUpcaBarcodeAttributes, 'id'>;

const tableName = 'MstUPCABarcode';

const MstUpcaBarcode: ModelDefined<MstUpcaBarcodeAttributes, Creation> =
  sequelize.define(
    tableName,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      barcode: { type: DataTypes.STRING(12), allowNull: true },
      isMaterialUsed: { type: DataTypes.BOOLEAN, allowNull: true },
      isLocationUsed: { type: DataTypes.BOOLEAN, allowNull: true },
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
      indexes: [{ name: 'idx_mst_upca_barcode', fields: ['barcode'] }],
    },
  );

export { MstUpcaBarcode };
