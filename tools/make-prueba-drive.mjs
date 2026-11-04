// Baja unas pocas obras de Commons para la carpeta de prueba de la app (_export/Galerías-prueba/Sana).
// Serial, con UA del proyecto, valida magic bytes (downloadTo) y mide el archivo real.
import fs from 'fs';
import path from 'path';
import { getJSON, downloadTo, imgSize, sleep } from './lib.mjs';

const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const OUT = path.resolve('_export/Galerías-prueba/Sana');
const WANT = [
  ['monet-impresion-sol-naciente', 'File:Monet - Impression, Sunrise.jpg'],
  ['van-gogh-noche-estrellada', 'File:Van Gogh - Starry Night - Google Art Project.jpg'],
  ['vermeer-joven-perla', 'File:Johannes Vermeer (1632-1675) - The Girl With The Pearl Earring (1665).jpg'],
  ['friedrich-caminante-mar-de-nubes', 'File:Caspar David Friedrich - Wanderer above the sea of fog.jpg'],
  ['rafael-madonna-de-la-silla', 'File:Raphael Madonna della seggiola.jpg'],
];
fs.mkdirSync(OUT, { recursive: true });
for (const [slug, title] of WANT) {
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=3000&titles=' + encodeURIComponent(title);
  const j = await getJSON(api, { ua: UA });
  const ii = Object.values(j.query.pages)[0].imageinfo?.[0];
  if (!ii) { console.log('NO ENCONTRADO', title); continue; }
  const url = ii.width > 3000 ? ii.thumburl : ii.url;
  const dest = path.join(OUT, slug + '.jpg');
  try {
    await downloadTo(url, dest, { ua: UA });
    const sz = imgSize(fs.readFileSync(dest));
    console.log(slug, sz?.w + 'x' + sz?.h, (fs.statSync(dest).size / 1e6).toFixed(1) + ' MB |', ii.extmetadata?.LicenseShortName?.value, '|', ii.descriptionurl);
  } catch (e) { console.log('FALLO', slug, e.message); }
  await sleep(1500);
}
