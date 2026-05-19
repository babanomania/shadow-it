import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// @resvg/resvg-js: pure WASM, no system deps, renders SVG → PNG
const { Resvg } = await import('@resvg/resvg-js');

const svgPath = resolve(root, 'public', 'og.svg');
const pngPath = resolve(root, 'public', 'og.png');

const svg = readFileSync(svgPath, 'utf-8');

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
});

const png = resvg.render().asPng();
writeFileSync(pngPath, png);

console.log(`og.png written (${png.length} bytes)`);
