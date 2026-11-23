/**
 * RAMS In-Browser Zero-Dependency Vector QR Generator
 * Generates instant crisp SVG strings for telephony URIs (tel:...)
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGeneratorPoly(ecLen: number): number[] {
  let g = [1];
  for (let i = 0; i < ecLen; i++) {
    const ng = new Array(g.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= gfMul(g[j], factor);
      ng[j + 1] ^= g[j];
    }
    g = ng;
  }
  return g;
}

function rsEncode(dataBytes: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Array(dataBytes.length + ecLen).fill(0);
  for (let i = 0; i < dataBytes.length; i++) res[i] = dataBytes[i];
  for (let i = 0; i < dataBytes.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(dataBytes.length);
}

export function generateQrMatrix(text: string): boolean[][] {
  const enc = new TextEncoder();
  const textBytes = enc.encode(text);
  const dataLen = textBytes.length;

  let version = 1;
  let size = 21;
  let totalDataCodewords = 16;
  let ecCodewords = 10;

  if (dataLen > 14 && dataLen <= 26) {
    version = 2;
    size = 25;
    totalDataCodewords = 28;
    ecCodewords = 16;
  } else if (dataLen > 26) {
    version = 3;
    size = 29;
    totalDataCodewords = 44;
    ecCodewords = 26;
  }

  let bits = '0100' + dataLen.toString(2).padStart(8, '0');
  for (let i = 0; i < textBytes.length; i++) {
    bits += textBytes[i].toString(2).padStart(8, '0');
  }

  const maxBits = totalDataCodewords * 8;
  const rem = maxBits - bits.length;
  if (rem > 0) bits += '0'.repeat(Math.min(4, rem));
  if (bits.length % 8 !== 0) bits += '0'.repeat(8 - (bits.length % 8));

  const pad = ['11101100', '00010001'];
  let pIdx = 0;
  while (bits.length < maxBits) {
    bits += pad[pIdx % 2];
    pIdx++;
  }

  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    dataCodewords.push(parseInt(bits.substring(i, i + 8), 2));
  }

  const ecBytes = rsEncode(dataCodewords, ecCodewords);
  const finalCodewords = dataCodewords.concat(ecBytes);

  const grid: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isReserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setPattern = (rStart: number, cStart: number, pattern: number[][]) => {
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        grid[rStart + r][cStart + c] = pattern[r][c];
        isReserved[rStart + r][cStart + c] = true;
      }
    }
  };

  const finder = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  setPattern(0, 0, finder);
  setPattern(0, size - 7, finder);
  setPattern(size - 7, 0, finder);

  for (let i = 0; i < 8; i++) {
    const pts = [
      [7, i], [i, 7], [7, size - 1 - i], [i, size - 8], [size - 8, i], [size - 1 - i, 7]
    ];
    for (const [r, c] of pts) {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        grid[r][c] = 0;
        isReserved[r][c] = true;
      }
    }
  }

  if (version === 2) {
    setPattern(16, 16, [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ]);
  } else if (version === 3) {
    setPattern(20, 20, [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ]);
  }

  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    grid[6][i] = val;
    isReserved[6][i] = true;
    grid[i][6] = val;
    isReserved[i][6] = true;
  }

  grid[4 * version + 9][8] = 1;
  isReserved[4 * version + 9][8] = true;

  for (let i = 0; i < 9; i++) {
    isReserved[8][i] = true;
    isReserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    isReserved[8][size - 1 - i] = true;
    isReserved[size - 1 - i][8] = true;
  }

  let codewordBits = '';
  for (const cw of finalCodewords) {
    codewordBits += cw.toString(2).padStart(8, '0');
  }

  let bitIdx = 0;
  let row = size - 1;
  let col = size - 1;
  let direction = -1;

  while (col > 0) {
    if (col === 6) col--;
    for (let rIdx = 0; rIdx < size; rIdx++) {
      for (const cOff of [0, -1]) {
        const c = col + cOff;
        const r = row;
        if (!isReserved[r][c]) {
          let b = bitIdx < codewordBits.length ? parseInt(codewordBits[bitIdx], 10) : 0;
          bitIdx++;
          if ((r + c) % 2 === 0) b ^= 1;
          grid[r][c] = b;
        }
      }
      row += direction;
    }
    row -= direction;
    direction = -direction;
    col -= 2;
  }

  const formatBits = '101010000010010';
  for (let i = 0; i < 6; i++) grid[8][i] = parseInt(formatBits[i], 10);
  grid[8][7] = parseInt(formatBits[6], 10);
  grid[8][8] = parseInt(formatBits[7], 10);
  grid[7][8] = parseInt(formatBits[8], 10);
  for (let i = 9; i < 15; i++) grid[14 - i][8] = parseInt(formatBits[i], 10);

  for (let i = 0; i < 8; i++) grid[8][size - 1 - i] = parseInt(formatBits[i], 10);
  for (let i = 8; i < 15; i++) grid[size - 15 + i][8] = parseInt(formatBits[i], 10);

  return grid.map((r) => r.map((cell) => cell === 1));
}
