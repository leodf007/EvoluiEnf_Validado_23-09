const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Função para calcular CRC32 para chunks PNG
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Gera um PNG RGBA sólido com logotipo minimalista
function generatePNG(width, height, r, g, b) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits por canal
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compressão
  ihdrData.writeUInt8(0, 11); // filtro
  ihdrData.writeUInt8(0, 12); // interlacing
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines: cada linha começa com byte de filtro 0
  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLen);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // sem filtro
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Desenha fundo teal escuro #0f766e
      let pr = r;
      let pg = g;
      let pb = b;
      let pa = 255;

      // Desenha cruz médica branca no centro
      const cx = width / 2;
      const cy = height / 2;
      const armWidth = width * 0.15;
      const armLength = width * 0.55;

      const inVert = Math.abs(x - cx) < armWidth / 2 && Math.abs(y - cy) < armLength / 2;
      const inHoriz = Math.abs(y - cy) < armWidth / 2 && Math.abs(x - cx) < armLength / 2;

      if (inVert || inHoriz) {
        pr = 255;
        pg = 255;
        pb = 255;
      }

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
      rawData[pixelOffset + 3] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Teal 700: rgb(15, 118, 110)
const png192 = generatePNG(192, 192, 15, 118, 110);
const png512 = generatePNG(512, 512, 15, 118, 110);
const pngMaskable = generatePNG(512, 512, 19, 78, 74); // Teal 900
const appleTouch = generatePNG(180, 180, 15, 118, 110);
const faviconIco = generatePNG(32, 32, 15, 118, 110);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconIco);

console.log('PWA icons successfully generated in /public');
