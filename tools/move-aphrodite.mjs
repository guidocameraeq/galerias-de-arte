// Mueve "Aphrodite of Syracuse" (16 n37) a la colección 01 (mitología grecorromana),
// donde están las esculturas antiguas. Corrige el autor falso (Canova -> Anónimo),
// escuela y descripción. Deja hueco en 16 n37 (el proyecto ya tolera huecos, p.ej. 01 n10).
// Uso: node tools/move-aphrodite.mjs [--apply]
import { loadIndex, saveIndex, buildFilename } from './lib.mjs';
import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const SRC = '16_neoclasicismo', DST = '01_mitologia_griega_romana';
const TARGET_N = 10; // hueco existente en 01

const src = await loadIndex(SRC);
const dst = await loadIndex(DST);
const it = src.items.find(x => x.n === 37);
if (!it) { console.log('No se encontró 16 n37. ¿Ya movido?'); process.exit(0); }
if (dst.items.some(x => x.n === TARGET_N)) throw new Error(`01 ya tiene n${TARGET_N}; el hueco se ocupó.`);

const newFile = buildFilename(TARGET_N, 'Afrodita de Siracusa', 'Anónimo', String(it.year || '200'));
const oldPath = path.join(SRC, it.orientation, it.file);
const newPath = path.join(DST, it.orientation, newFile);
console.log(`MOVER  ${oldPath}\n   ->  ${newPath}`);
console.log(`01: insertar en n${TARGET_N} (hueco). Autor Canova->Anónimo, escuela->Arte griego clásico.`);
console.log(`16: quitar n37 (queda hueco). ${src.items.length} -> ${src.items.length - 1} obras.`);

const moved = {
  ...it,
  n: TARGET_N,
  file: newFile,
  title: 'Aphrodite of Syracuse',
  title_es: 'Afrodita de Siracusa',
  artist: 'Anónimo',
  artist_museum: '',
  school: 'Arte griego clásico',
  type: 'Escultura en mármol',
  holding_museum: 'Museo Arqueológico Nacional de Atenas',
  description: 'Una estatua grecorromana de Afrodita, diosa del amor y la belleza, de cuerpo idealizado y un manto que se desliza en torno a las caderas. Es una copia romana —hacia el siglo II— de un modelo griego helenístico, hoy en el Museo Arqueológico Nacional de Atenas. La belleza ideal del desnudo femenino antiguo.',
  description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)',
};

if (!APPLY) { console.log('\nDRY. Re-ejecutar con --apply.'); process.exit(0); }

if (!existsSync(oldPath)) throw new Error('Falta el archivo origen: ' + oldPath);
if (existsSync(newPath)) throw new Error('El destino ya existe: ' + newPath);
await fsp.mkdir(path.dirname(newPath), { recursive: true });
await fsp.rename(oldPath, newPath);

dst.items.push(moved);
dst.items.sort((a, b) => a.n - b.n);
await saveIndex(DST, dst);

src.items = src.items.filter(x => x.n !== 37);
src.items.sort((a, b) => a.n - b.n);
await saveIndex(SRC, src);

console.log(`\nAPLICADO. 01 ahora ${dst.items.length} obras; 16 ahora ${src.items.length} obras.`);
