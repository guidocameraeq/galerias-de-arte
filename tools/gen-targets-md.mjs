// Genera _targets.md (tabla curada) para una colección desde sus datos targets-0N.mjs.
// Uso: node tools/gen-targets-md.mjs <colDir>
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SRC = { met: 'MET', cle: 'CLE', wmc: 'WMC' };
const colDir = process.argv[2];
const num = colDir.slice(0, 2);
const mod = await import(`./targets-${num}.mjs`);
const targets = mod[`TARGETS_${num}`];
const subjects = mod[`MET_SUBJECTS_${num}`] || [];
const cats = mod[`WMC_CATEGORIES_${num}`] || [];

const titles = { '03': 'Gótico / medieval tardío', '04': 'Romanticismo', '05': 'Egipcio', '06': 'Macabro / memento mori' };
let md = `# Targets — ${num} · ${titles[num] || colDir}\n\n`;
md += `> Listado curado de obras objetivo (research de historia del arte). "Fuente prob." es\n`;
md += `> una apuesta; la búsqueda confirma disponibilidad, licencia (dominio público/CC0) y\n`;
md += `> resolución. Generado desde \`tools/targets-${num}.mjs\` (la fuente de verdad del runner).\n\n`;
md += `## Leyenda de fuente\n\`MET\` \`CLE\` (Cleveland) \`WMC\` (Wikimedia Commons)\n\n---\n\n`;
md += `| #  | Obra | Autor | ~Año | Fuente prob. |\n|----|------|-------|------|------|\n`;
for (const t of targets) md += `| ${t.n} | ${t.title} | ${t.artist} | ${t.year} | ${SRC[t.src] || t.src} |\n`;
md += `\n## Barrido de descubrimiento (más allá del listado)\n`;
md += `- **Met** (subjects): ${subjects.join(', ')}\n`;
md += `- **Wikimedia** (categorías): ${cats.join(', ')}\n`;
md += `- Reglas de calidad: solo dominio público/CC0, lado largo ≥1000px (piso duro),\n`;
md += `  Full HD+ preferido en el descubrimiento, sin recortar, separar landscape/portrait.\n`;
if (mod[`EXCLUDE_CHRISTIAN_${num}`]) md += `- **Exclusión dura:** temática cristiana/Jesús (crucifixiones, devoción a Cristo).\n`;

await fs.writeFile(path.join(colDir, '_targets.md'), md);
console.log(`_targets.md generado para ${colDir} (${targets.length} targets).`);
