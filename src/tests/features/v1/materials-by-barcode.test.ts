import assert from 'node:assert/strict';
import { Request } from 'express';
import { MaterialsQueryService } from '@/features/v1/materials/materials.query.service';

const fakeRepo = (material: unknown) => ({
  getByBarcode: async () =>
    material ? { get: () => ({ code: 'MAT001', barcode: '012345678905' }) } : null,
});
const req = {} as Request;

describe('materials byBarcode (scan dashboard Stock Availability)', () => {
  it('barcode terdaftar → data material', async () => {
    const svc = new MaterialsQueryService(fakeRepo({}) as any, {} as any);
    const res = await svc.byBarcode('012345678905', req);
    assert.equal(res.httpCode, 200);
    assert.equal(res.data.code, 'MAT001');
  });

  it('barcode tidak terdaftar → data null (bukan error)', async () => {
    const svc = new MaterialsQueryService(fakeRepo(null) as any, {} as any);
    const res = await svc.byBarcode('999999999999', req);
    assert.equal(res.httpCode, 200);
    assert.equal(res.data, null);
  });
});
