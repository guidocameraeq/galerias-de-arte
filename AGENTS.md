# AGENTS.md — Arte

> Entrada canónica para CUALQUIER agente (Claude Code, Gemini CLI, OpenCode, Codex…). `CLAUDE.md` y `GEMINI.md` solo importan este archivo.
> Acá van las reglas que, si las borrás, te hacen equivocar. **No hay estado ni conteos** (rotan): para eso `docs/SESSION_HANDOFF.md` y `node tools/audit.mjs`.

## Qué es
Biblioteca **curada** de obras de arte en **ALTA RESOLUCIÓN** para **uso personal** del usuario (las ve como slideshow/modo reposo en su TV). Colecciones `NN_nombre/` por escuela/época; cada obra = archivo en `landscape/` o `portrait/` + ficha en español dentro de `<col>/_index.json`. Motor **100% Node.js** (sin Python/Pillow). Se trabaja desde la raíz del proyecto.

## Reglas duras (no negociables)
1. **Pocas obras excelentes > muchas mediocres.** Calidad y relevancia mandan sobre tamaño o formato.
2. **Las imágenes NO se editan, recortan, retocan ni convierten.** Tampoco se filtra por aspect ratio (vertical y cuadrada entran igual: `w>=h` → `landscape/`, si no `portrait/`).
3. **El archivo en disco es la verdad, no la API.** Medí siempre el archivo descargado (Wikimedia clampea renders y promete más de lo que entrega).
4. **Piso de resolución: lado largo ≥1000 px (≥800 en 13–15).** Una obra **NUEVA** por debajo se descarta (salvo que el usuario la acepte: icónica sin versión mejor; anotarlo en `docs/CALIDAD.md` §4). Las **existentes** por debajo salen como AVISO `W-RES` en `audit`: se justifican o se corrigen.
5. **Dry-run por defecto**: casi todo script escribe solo con `--apply`. Excepciones: `collect.mjs` baja salvo `--dry`; `dore-desc.mjs` no tiene dry-run y renombra archivos. **Antes de una descarga o poda masiva, mostrale al usuario el dry-run (o la lista de targets) y esperá su OK.**
6. **Nunca editar `_index.json` a mano ni mover/borrar imágenes a mano.** Para sacar UNA obra: `node tools/remove-work.mjs <col> --n=N --apply` (la MUEVE a `<col>/_dedup_removed/`, la quita del índice, loguea el descarte y limpia su ficha). Las imágenes no están en git: lo borrado no vuelve.
7. **Un solo escritor a la vez** sobre un `_index.json` (los scripts leen-modifican-reescriben todo; dos agentes en paralelo se pisan). No hay lock técnico: se respeta.
8. **Descripciones en español, sintetizadas de una fuente (Wikipedia/curatorial), NUNCA de memoria.** Enfoque: qué muestra y qué significa. Guardar `description_source`.
9. **Colección 06:** exclusión DURA de temática cristiana/Jesús (crucifixiones, escenas devocionales de Cristo).
10. **Licencia = uso personal:** se registra `license`, no se descarta por ella (ojo: `resolve.mjs`/`discover.mjs` todavía filtran PD/CC0 en 01–06). **Fuentes:** Met, Cleveland, Wikimedia/Wikidata y WikiArt están OK; Google Arts & Culture (tiles cifrados) y scrapear HTML de sitios de museos solo si el usuario lo pide para una obra puntual (`docs/FUENTES.md`).
11. **Evidencia o NO VERIFICADO.** Nada de "listo" a secas: reportá con la salida real (`audit`, conteos, diffs) o decí que no lo verificaste. Si algo no está en los docs, no lo inventes.

## Trampas que rompen cosas si no las sabés
1. **`_index.json` es un OBJETO `{collection, items:[…]}`, no un array.** Las obras están en `.items`.
2. **Descripciones 01–15: la fuente de verdad es `tools/desc/NN.mjs`**, que se vuelca con `node tools/apply-desc.mjs <col> --apply`. Editar `description` directo en el índice se pierde en la próxima corrida. 16 y gap-fill usan `enrich-es.mjs`; la 17, `dore-desc.mjs`. (`docs/DESCRIPCIONES.md`)
3. **La colección 17 (Doré) es excepcional:** sin `holding_museum`/`year` por grabado, `title_es` = "Infierno · Canto N". No la valides con las reglas de ficha del resto.
4. **Scripts de UNA pasada, NO re-ejecutar:** `dore.mjs` (baja sin validar; para Doré, `dore-redownload.mjs`), `dore-dedup-apply.mjs` y `gap-desc.mjs` (abortan solos), `move-aphrodite.mjs`, y `prune-canon.mjs`/`prune-modern.mjs` (en dry proponen sacar obras ya aceptadas y renumeran, lo que desfasa las fichas; ahora al menos MUEVEN en vez de borrar). `enrich-es --force` pisa las fichas hechas a mano.
5. **`n` y `file` no son identificadores estables** (se renumera/renombra). Referenciá obras por `qid`/`sourceId`. `n` puede tener huecos.
6. **`apply-desc.mjs` pega las fichas POR `n`.** Si podás/renumerás/movés una obra, sacá su entrada de `tools/desc/NN.mjs` (`remove-work` lo hace solo); si no, la ficha cae en otra obra. `audit` lo avisa como `W-DESC-STALE`: no corras `apply-desc` con ese aviso activo.
7. Hay archivos `.jpg` cuyo contenido es PNG/WebP (`audit` los lista como `W-EXT`). No renombrar ni convertir sin pedido del usuario.

## Cómo verificar (hacelo antes de decir "listo")
```
node tools/audit.mjs          # solo lectura, ~10 s, sin red. exit 1 si hay FALLAS
node tools/audit.mjs --col=17 # una colección · --all lista todos los avisos · --json
```
Valida forma del índice, que cada archivo exista y sea imagen real, dims reales = índice, orientación, huérfanos, fichas, fichas desfasadas y duplicados. Es la **única fuente de los números de estado**.

## Rituales (palabras clave — funcionan en cualquier agente)
- El usuario dice **"inicio"** (o "retomemos", "¿en qué quedamos?") → seguí `docs/procesos/INICIO.md`. No toques nada hasta su OK.
- El usuario dice **"cierre"** (o "cierre parcial" si se llena el contexto) → seguí `docs/procesos/CIERRE.md`.
- Una sesión = una misión. Si aparece otra de verdad, proponé cierre y sesión nueva.

## Mapa de docs (leé por niveles: solo lo que la tarea toque)
| Nivel | Archivo | Para qué |
|---|---|---|
| 0 | `AGENTS.md` | Este archivo. Siempre. |
| 1 | `docs/SESSION_HANDOFF.md` | Dónde quedamos (se sobreescribe en cada cierre) |
| 1 | `docs/TODO.md` | Única fuente de pendientes |
| 2 | `docs/INVENTARIO.md` | Contrato de datos: carpetas, nombres, esquema de `_index.json`, cómo agregar/quitar sin romper |
| 2 | `docs/CALIDAD.md` | Cómo se garantiza que las piezas son buenas: gates, umbrales, revisión visual |
| 2 | `docs/DESCRIPCIONES.md` | Cómo se hacen las fichas en español |
| 2 | `docs/FUENTES.md` | APIs, User-Agent, trampas de cada fuente |
| 2 | `docs/METODO.md` | Cómo se construyó todo y por qué (decisiones, descartes, lecciones) |
| 2 | `docs/REUTILIZAR.md` | Cómo levantar este método en otro proyecto |
| 2 | `tools/README.md` | Índice de scripts con su comando |
| — | `docs/CHANGELOG.md` · `docs/archive/` | Historia. `archive/legacy-2026-06/` = docs viejos (`*.legacy.md`) que pueden contradecir al código |

Si un doc y el código discrepan, **manda el código**; corregí el doc.

## Entorno
Windows 11. Node v18+ (fetch nativo). Sin Python. `sharp` se usa en la revisión visual de Doré (`dore*.mjs`); `jimp` está instalado y sin uso. Git local **sin remoto**: versiona docs, `tools/`, `.claude/` e `_index.json`/`_descartes`; **ignora las imágenes**. Shell: PowerShell o Git Bash; rutas con `/`.

## Trabajo futuro (NO empezar sin que el usuario lo pida)
Visor/caption para la TV: capa de presentación para DESPUÉS de cerrar la curaduría (ver `docs/TODO.md` 🟢). Hoy no existe tooling.

## Comunicación
Español rioplatense (vos), en criollo: corto, sin jerga. El usuario no es programador y dicta por voz. Decisiones: opciones con pros/contras y UNA recomendación. Explicá qué cambiaste, no narres el proceso.
