/**
 * Render barcode UPCA menjadi SVG string — pengganti BarcodeLib+SkiaSharp
 * CoreApp (GenerateBarcodePrint). Murni TS tanpa dependency; SVG dipakai
 * langsung oleh FE (<img src="data:image/svg+xml;base64,...">) — lebih tajam
 * untuk cetak label.
 */

// Pola digit UPCA: kiri (L-code) 0-9, kanan (R-code) = komplemen L
const L_PATTERNS = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011',
];
const GUARD = '101';
const MID_GUARD = '01010';

/** Checksum UPCA (digit ke-12) dari 11 digit pertama. */
export function calculateUpcaChecksum(elevenDigits: string): number {
  let sum = 0;
  for (let i = 0; i < elevenDigits.length; i++) {
    const d = Number(elevenDigits[i]);
    sum += i % 2 === 0 ? d * 3 : d; // posisi genap (0-index) ×3 — standar UPCA
  }
  return (10 - (sum % 10)) % 10;
}

/** Encode 12 digit UPCA → 95 modul biner. */
function encodeUpca(barcode: string): string {
  const digits = barcode.split('').map(Number);
  let modules = GUARD;
  digits.slice(0, 6).forEach((d) => (modules += L_PATTERNS[d]));
  modules += MID_GUARD;
  digits.slice(6).forEach((d) => {
    modules += L_PATTERNS[d].split('').map((b) => (b === '1' ? '0' : '1')).join('');
  });
  modules += GUARD;
  return modules;
}

/** SVG UPCA — dimension default 290x150 (paritas output CoreApp). */
export function upcaToSvg(barcode: string, width = 290, height = 150): string {
  const clean = barcode.replace(/\D/g, '').slice(0, 11).padEnd(11, '0');
  const check = calculateUpcaChecksum(clean);
  const full = `${clean}${check}`;
  const modules = encodeUpca(full);
  const moduleWidth = width / modules.length;
  const barTop = 8;
  const barHeight = height - 40;

  let bars = '';
  let x = 0;
  modules.split('').forEach((m) => {
    if (m === '1') {
      bars += `<rect x="${x.toFixed(2)}" y="${barTop}" width="${moduleWidth.toFixed(2)}" height="${barHeight}" fill="#000"/>`;
    }
    x += moduleWidth;
  });

  const digitY = barTop + barHeight + 4;
  const digitSize = Math.max(10, Math.floor(height / 12));
  const digitW = width / 12;
  const human = full
    .split('')
    .map((d, i) => `<text x="${(i * digitW + digitW / 2).toFixed(1)}" y="${digitY}" font-family="monospace" font-size="${digitSize}" text-anchor="middle" fill="#000">${d}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#fff"/>${bars}${human}</svg>`;
}

/** SVG → data URI base64 (siap dipakai <img src>). */
export function upcaToDataUri(barcode: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(upcaToSvg(barcode)).toString('base64')}`;
}
