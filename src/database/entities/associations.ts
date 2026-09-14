import { MstZone } from './mst-zone.entity';
import { MstLocation } from './mst-location.entity';
import { MstMaterial } from './mst-material.entity';
import { MstMaterialLocationMapping } from './mst-material-location-mapping.entity';

export function setupAssociations() {
  // Master data WMS — MstLocation belongs to MstZone
  MstLocation.belongsTo(MstZone, { foreignKey: 'zoneId', as: 'zone' });
  MstZone.hasMany(MstLocation, { foreignKey: 'zoneId', as: 'locations' });

  // Mapping — belongs to material & location
  MstMaterialLocationMapping.belongsTo(MstMaterial, {
    foreignKey: 'materialId',
    as: 'material',
  });
  MstMaterialLocationMapping.belongsTo(MstLocation, {
    foreignKey: 'locationId',
    as: 'location',
  });
}
