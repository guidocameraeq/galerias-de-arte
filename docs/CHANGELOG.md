# CHANGELOG — Arte

> Historia permanente. `cierre` agrega una entrada AL TOPE en cada sesión. Orden descendente estricto. Los números de estado NO se repiten acá: salen de `node tools/audit.mjs`. El detalle fino de las sesiones anteriores está íntegro en `docs/archive/legacy-2026-06/` (CLAUDE.md y PLAN.md viejos).

## 2026-10-15 — Proyecto levantable por cualquier agente (AGENTS.md + docs + audit)

### Added
- `tools/remove-work.mjs`: saca UNA obra de forma recuperable (mueve a `_dedup_removed/`, quita el item, loguea el descarte, limpia su entrada de `tools/desc/`). Dry-run por defecto; probado en un proyecto de juguete aislado.
- `AGENTS.md` canónico (≤120 líneas) + adaptadores `CLAUDE.md` y `GEMINI.md` (importan `AGENTS.md`). Lectura por niveles, rituales por palabra clave (`inicio`/`cierre`).
- `docs/`: `SESSION_HANDOFF`, `TODO`, `CHANGELOG`, `procesos/{INICIO,CIERRE}`, y los documentos de conocimiento `METODO`, `CALIDAD`, `INVENTARIO`, `DESCRIPCIONES`, `FUENTES`, `REUTILIZAR` (escritos contra el código real, con citas `archivo:línea` y marcas `[NO VERIFICADO]`).
- `tools/audit.mjs`: verificación de solo lectura del inventario (forma del índice, magic bytes, dims reales, orientación, huérfanos, fichas, duplicados, fichas desfasadas). Es la fuente de los números de estado.
- `.claude/` (skills `inicio`/`cierre` como atajos a `docs/procesos/`, hook SessionStart, hook de sintaxis para `.mjs`/`.json`).
- Repo git local (sin remoto) que versiona docs, `tools/`, `_index.json` y `_descartes/`; ignora los binarios de imagen.

### Changed
- `lib.downloadTo` ahora **valida el contenido** (magic bytes) y rechaza páginas de error HTML con HTTP 200 (reintenta; si no se recupera, lanza sin escribir). Era el bug que dejó 155 archivos de la col 17 rotos.
- `lib.loadIndex` **lanza** si el `_index.json` está roto (antes devolvía un índice vacío y el siguiente `saveIndex` pisaba la colección).
- Los retiros ahora MUEVEN en vez de borrar: `prune-canon.mjs`, `prune-modern.mjs` y `dore-dedup.mjs --apply` (antes `unlink`/`rm`; las imágenes no están en git). `dore-dedup-apply.mjs` y `gap-desc.mjs` (un solo uso, numeración vieja) ahora abortan siempre.
- `lib.imgSize` mide también WebP; `looksLikeImage` rechaza TIFF (nada lo mide).
- `tools/README.md` actualizado (audit, advertencias de `dore.mjs`/`dore-dedup-apply`, `desc/01…16`).
- `CLAUDE.md` viejo (322 líneas, contradictorio) reemplazado por el adaptador; su contenido migró a `docs/`. `PLAN.md` y `START_HERE.md` retirados (copias íntegras en `docs/archive/legacy-2026-06/`).

### Fixed
- `tools/desc/{01,02,11}.mjs` estaban desfasados respecto de los índices (pegan por `n`): 01 n10 (Venus de Rokeby ya reemplazada), 02 n40 (obra eliminada), 11 (22 fichas corridas por una poda). Corregidos; `audit` ahora avisa `W-DESC-STALE`.
- El "~5,8 GB" y los conteos escritos a mano en los docs viejos eran inexactos; ahora salen de `audit`.

## Historial previo (resumen; detalle completo en `docs/archive/legacy-2026-06/`)

- **2026-06-28** — Rescate de la col 17 (Doré): los 155 archivos eran HTML de error de 2 KB (rate-limit 429 servido con HTTP 200); re-bajados full-res con `dore-redownload.mjs`. Dedup visual 155→98 (hojas de contacto + dHash); 57 duplicados movidos a `_dedup_removed/`. +8 fichas a mano → 100% con ficha. *Afrodita de Siracusa* (autor falso "Canova") corregida a anónima y movida 16→01. Verificado que Ernst "Europa después de la lluvia" no es un recorte.
- **2026-06-16** — Nueva colección 17 (Doré · Divina Comedia). Análisis de brechas (`gap.mjs`) contra el ranking de fama de Wikidata → gap-fill del canon (+~330 obras), nueva 16 Neoclasicismo, esculturas antiguas en 01/05. Descripciones por QID→es.wikipedia (`enrich-es.mjs`). Eliminados 2 duplicados (02 *Man Reading*, 12 *Amaranth*) y el dup *Rokeby Venus*.
- **2026-06-15** — Proyecto base completo: Fase 2 (fichas en español autoradas, `tools/desc/`), Fase 3 (canon europeo Wikidata-first, 07–12, `canon.mjs`) y Fase 4 (modernas con copyright vía WikiArt, 13–15). Se relaja la regla de licencia a "uso personal". Google Arts & Culture gigapíxel descartado (tiles cifrados).
- **2026-06-14** — Colecciones 03, 04, 05 y 06 completas. Aprendizajes: anti-IA/moderno en descubrimiento, `maxYear` consciente de a.C., dedup por contenido, `downloadTo` con backoff.
- **2026-06-13** — Setup (entorno Node, sin Python), colecciones 01 y 02, motor `collect.mjs`. Hallazgo clave: Wikimedia clampea los renders grandes → medir siempre el archivo real.
