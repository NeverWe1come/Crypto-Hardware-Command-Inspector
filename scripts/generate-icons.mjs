import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgPath = path.join(rootDir, 'apps/explorer/public/media/app/logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

const tauriIconsDir = path.join(rootDir, 'apps/explorer/src-tauri/icons');
const publicAppDir = path.join(rootDir, 'apps/explorer/public/media/app');

async function generatePng(page, size, outputPath) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: ${size}px;
            height: ${size}px;
            background: transparent;
            overflow: hidden;
          }
          svg {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html);
  await page.screenshot({ path: outputPath, omitBackground: true });
  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

/**
 * Packs multiple PNG buffers into a standard Windows .ico file
 */
function packIco(pngBuffers) {
  // ICO Header: 6 bytes
  // 0-1: Reserved (0)
  // 2-3: Type (1 = ICO)
  // 4-5: Number of images
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  // Directory entries: 16 bytes per image
  const dirSize = numImages * 16;
  const dirBuffers = [];
  let currentOffset = 6 + dirSize;

  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(16);
    // Width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    // Height (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    // Color palette (0 = no palette)
    entry.writeUInt8(0, 2);
    // Reserved
    entry.writeUInt8(0, 3);
    // Color planes (1)
    entry.writeUInt16LE(1, 4);
    // Bits per pixel (32 for RGBA PNG)
    entry.writeUInt16LE(32, 6);
    // Size of image data
    entry.writeUInt32LE(buffer.length, 8);
    // Offset from start of file
    entry.writeUInt32LE(currentOffset, 12);

    dirBuffers.push(entry);
    currentOffset += buffer.length;
  }

  const allBuffers = [header, ...dirBuffers, ...pngBuffers.map((p) => p.buffer)];
  return Buffer.concat(allBuffers);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Generate PNGs
  const p512 = path.join(tauriIconsDir, 'icon.png');
  const p256 = path.join(tauriIconsDir, '128x128@2x.png');
  const p128 = path.join(tauriIconsDir, '128x128.png');
  const p32 = path.join(tauriIconsDir, '32x32.png');
  const p16 = path.join(publicAppDir, 'favicon-16x16.png');
  const p32_fav = path.join(publicAppDir, 'favicon-32x32.png');

  await generatePng(page, 512, p512);
  await generatePng(page, 256, p256);
  await generatePng(page, 128, p128);
  await generatePng(page, 32, p32);
  await generatePng(page, 16, p16);
  await generatePng(page, 32, p32_fav);

  // Read generated PNGs for ICO packaging
  const icoSizes = [16, 32, 64, 128, 256];
  const icoPngBuffers = [];

  for (const s of icoSizes) {
    const tempPath = path.join(tauriIconsDir, `temp_${s}.png`);
    await generatePng(page, s, tempPath);
    const buf = fs.readFileSync(tempPath);
    fs.unlinkSync(tempPath);
    icoPngBuffers.push({ buffer: buf, size: s });
  }

  const icoBuffer = packIco(icoPngBuffers);
  fs.writeFileSync(path.join(tauriIconsDir, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicAppDir, 'favicon.ico'), icoBuffer);
  console.log(`Generated: icon.ico & favicon.ico (${icoSizes.join(', ')} px)`);

  await browser.close();
  console.log('Icon generation completed successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
