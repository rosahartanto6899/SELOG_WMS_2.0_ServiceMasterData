/**
 * Self-check UPCA util — jalankan: npx ts-node -r tsconfig-paths/register src/tests/utils/upca-svg.check.ts
 * (repo belum punya runner test terpasang — mocha/chai tidak di-install)
 */
import { calculateUpcaChecksum, upcaToSvg } from '@/utils/upca-svg.util';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

// checksum kanonik Wikipedia: 03600029145 → check digit 2
assert(calculateUpcaChecksum('03600029145') === 2, 'checksum 03600029145 harus 2');
assert(calculateUpcaChecksum('72527273070') === 6, 'checksum 72527273070 harus 6');

// 95 modul total, bar hitam barcode valid 036000291452 = 52 (dihitung manual)
const svg = upcaToSvg('036000291452');
assert((svg.match(/<rect [^>]*fill="#000"/g) ?? []).length === 52, 'jumlah bar hitam harus 52');
assert((svg.match(/<text /g) ?? []).length === 12, '12 digit human-readable');

// 11 digit input → checksum otomatis
assert(upcaToSvg('03600029145').includes('2</text>'), 'check digit 2 dirender');

console.log('upca-svg OK');
