import { Request } from 'express';
import { IDataUser } from '@/shared-libs/interfaces/user-data.interface';

/** Konteks customer dari token user — pengganti sesi CustomerCode CoreApp.
 *  Token tanpa klaim customerCode (mis. SUPERADMIN) → undefined, sehingga
 *  filter customerCode di query Sequelize dilewati (lihat semua data). */
export function customerContext(req: Request): {
  customerCode?: string;
  customerName: string;
} {
  const user = req.user as unknown as IDataUser;
  return {
    customerCode: user?.tokenCustomerCode || undefined,
    customerName: user?.tokenCustomerName ?? '-',
  };
}

/** Spread ke where Sequelize: token tanpa customerCode (mis. SUPERADMIN)
 *  → objek kosong → query tidak difilter customer (lihat semua). */
export function customerScope(customerCode?: string): {
  customerCode?: string;
} {
  return customerCode ? { customerCode } : {};
}

/** Konteks gudang aktif dari token user (header "Switch Warehouse" FE).
 *  Token tanpa klaim warehouse (mis. admin) → undefined → query tidak difilter. */
export function warehouseContext(req: Request): {
  warehouseCode?: string;
  warehouseName?: string;
} {
  const user = req.user as unknown as IDataUser;
  return {
    warehouseCode: user?.tokenWarehouseCode || undefined,
    warehouseName: user?.tokenWarehouseName ?? '-',
  };
}

/** Resolve scope customer — klaim token MENANG; token tanpa klaim (admin)
 *  boleh pakai query param. Mencegah user biasa menimpa scope via ?customerCode=. */
export function scopedCustomerCode(
  req: Request,
  queryCustomerCode?: string,
): string | undefined {
  const { customerCode } = customerContext(req);
  return customerCode ?? queryCustomerCode;
}

/** Ambil query DTO — req.query sudah diganti instance DTO oleh QueryValidation.
 *  Satu titik cast eksplisit (ParsedQs → DTO) untuk semua controller. */
export function queryDto<T>(req: Request): T {
  return req.query as unknown as T;
}

/** User audit — pengganti UserLogin/DisplayName SP lama. */
export function userBy(req: Request): string {
  const user = req.user as unknown as IDataUser;
  return user?.tokenUserId ?? 'system';
}
