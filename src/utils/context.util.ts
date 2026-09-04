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

/** User audit — pengganti UserLogin/DisplayName SP lama. */
export function userBy(req: Request): string {
  const user = req.user as unknown as IDataUser;
  return user?.tokenUserId ?? 'system';
}
