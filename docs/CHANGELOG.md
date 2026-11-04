# CHANGELOG — Arte

> Historia permanente. `cierre` agrega una entrada AL TOPE en cada sesión. Orden descendente estricto. Los números de estado NO se repiten acá: salen de `node tools/audit.mjs`. El detalle fino de las sesiones anteriores está íntegro en `docs/archive/legacy-2026-06/` (CLAUDE.md y PLAN.md viejos).

## 2026-11-03 (b) — Sistema autónomo de colecciones: motor genérico, fichas por id, curaduría desde Drive

### Added
- `tools/harvest.mjs`: motor genérico de colección nueva desde `tools/targets/<col>.json` (Commons / Wikidata P18 / URL directa), con dedup contra toda la biblioteca, medición real, piso, registro de rechazos y fichas por id. Plantilla `tools/targets/_ejemplo.json`. Probado en sandbox.
- `tools/drive-curation.mjs`: lo que Guido borra en Drive sale del repo (recuperable) y se regenera su galería y las candidatas. Probado en sandbox.
- `tools/desc-add-ids.mjs` y `tools/assign-local-ids.mjs`: las 973 fichas quedaron clavadas por id; 50 obras de 22/23 recibieron `sourceId` local.
- `tools/galerias.mjs`: títulos de galería compartidos.

### Changed
- `apply-desc.mjs` pega por `id` (fallback `n`), acepta `autor`, avisa por >160 palabras. `audit.mjs` compara fichas por id.
- `export-drive.mjs`: no re-sube lo borrado en Drive, renombra en vez de duplicar, ids estables también para WikiArt/monografías, usa `forma` del índice.
- `candidatas.mjs`: conserva las brechas de Wikidata al regenerar sin red; motivo `curaduria`.
- `NUEVA_COLECCION.md` reescrito alrededor del motor (dos frenos con Guido); agentes y skill ajustados; `METODO.md` vía g.

### Fixed (revisión independiente de código, subagente Sonnet)
- `apply-desc` no usaba el id (el reemplazo no había pegado) y contaba mal las palabras: corregido y **probado renumerando las 38 obras de Rococó** (38/38 fichas en su obra). Conserva `d_fuente`.
- `export-drive`: lo borrado en Drive se sigue listando hasta `drive-curation` (antes se perdía la evidencia); freno >30%; busca el archivo anterior por todas las claves. Regla de ids compartida (`galerias.mjs` → `idsGaleria`) que también usa `drive-curation`, para no sacar nunca la obra equivocada.
- `harvest`: temporal dentro de la biblioteca (rename entre discos) y limpieza ante error; no re-baja obras retiradas con `remove-work`; registra qid y sourceId; agrega fichas validando el módulo.
- `saveIndex` atómico (tmp + rename). `candidatas` tolera líneas rotas.

## 2026-11-03 — Proceso de colección nueva, subagentes y registro de candidatas

### Added
- `docs/procesos/NUEVA_COLECCION.md` (checklist de 9 pasos), skill `/nueva-coleccion`, subagentes `investigador-curatorial`, `verificador-visual` y `redactor-fichas` en `.claude/agents/`.
- `tools/candidatas.mjs` + `tools/candidatas-manual.json` y `<col>/_candidatas.json` en las 23 colecciones (lo que NO entró y por qué).

### Changed
- `FLUJO_AGENTES.md`: decisión de subagentes tomada (solo lectura en paralelo; un único escritor de índices). `AGENTS.md`, `CLAUDE.md`, `README.md`, `INVENTARIO.md`, `tools/README.md` actualizados.

## 2026-11-02 — Repo ordenado, imágenes fuera del repo, Drive y contrato con la app Museum Slideshow

### Added
- `README.md` con banner; `docs/FORMATO_DRIVE.md` (contrato `galeria.json` v1 con la app, validado en la TV), `docs/FICHAS_APP.md`, `docs/ALMACENAMIENTO.md`, `docs/procesos/FLUJO_AGENTES.md`.
- Tooling: `link-images.mjs` (biblioteca de imágenes por PC vía junctions), `images-sync.mjs` (respaldo/restauración con Drive, solo copia), `fichas-stats.mjs`, `make-prueba-drive.mjs`, `make-prueba-json.mjs`, `check-prueba-json.mjs`.
- Respaldo completo de la biblioteca en Drive (`Galerías de arte/Respaldo`, privado) y `Galerías-prueba` compartida para la app.

### Changed
- Las imágenes ya no viven dentro del repo: `landscape/`, `portrait/` y `_dedup_removed/` son enlaces a la biblioteca de cada PC. `.gitignore` ignora enlaces, `.arte-local.json` y `_export/`.
- `AGENTS.md`: rol de historiador/curador, trampas de enlaces y de Drive/licencias, mapa de docs. `CIERRE.md` ahora incluye push.

### Fixed
- `10_realismo` n30–40: fichas corridas un lugar (tras sacar una obra); reasignadas, y *El pensador* tiene ficha propia. *Los luchadores* (Eakins) tenía la ficha de *Max Schmitt*.

### Added (tarde)
- `export-drive.mjs` y publicación de las 23 galerías en Drive `Galerías` (compartida); Rococó verificada en la TV. `contact-sheets.mjs` para revisión visual.

### Removed
- `START_HERE.md` (puntero huérfano).

## 2026-10-25 — Expansión masiva: 4 nuevas colecciones (18, 19, 20, 21), mitología épica y unificación de dark_art

### Added
- **Colección 18 (Escultura Griega y Arqueología Antigua, 64 obras maestras):** Bipolaridad de colecciones para slideshows de TV (escultura separada de pintura). Migradas 9 esculturas de 01 e ingresadas 55 obras en alta resolución de museos griegos (Atenas, Acrópolis, Delfos, Olimpia, Heraclión) e internacionales.
- **Colección 19 (Marcelo Canevari, 25 obras maestras):** Monografía de arte contemporáneo argentino y "Gótico rioplatense" (*La fiesta del fuego* bifaz de 5400 px, *La hora de las brujas*, *Iberá*, *Diecisiete fantasmas*, y la tapa original de *Post Mortem* de Dillom).
- **Colección 20 (Alfred Kubin, 40 obras maestras terminadas — refundación canónica):** Tras la queja del usuario por la presencia excesiva de bocetos y croquis pálidos del Leopold Museum, se cambió el orden del método curatorial (investigación del canon primero, recolección después). Se purgaron 16 bocetos y afiches menores mediante `remove-work.mjs` y se incorporaron 15 obras maestras canónicas en resoluciones de 1200 a 3200 px (Lenbachhaus de Múnich, Christie's París, Artera, Heidi Horten Collection), sumando sus cumbres a color (*El novio*, *Ruinas*, *El ser de Marte*, *La dama sobre el caballo*) y sus piezas de pesadilla más densas y oscuras (*La bruja*, *La epidemia*, *La peste*, *La angustia*, *Vista auténtica de Perla*, *El caballo fantasma*, *Danza de la noche de Walpurgis*, etc.). 100% de fichas autoradas en español.
- **Colección 21 (Rob Gonsalves, 25 obras maestras):** Monografía del pintor canadiense de realismo mágico e ilusiones ópticas (*The Sun Sets Sail*, *Sailing Islands*, *Wilderness Gothic*, *Here Comes the Flood*, *Musical Chairs*, etc.) en resoluciones de 1000 a 3000 px.
- **Expansión Épica en Colección 01 (+77 pinturas mitológicas):** La colección 01 pasa a 142 pinturas puras, incorporando 35 obras maestras generales y 42 obras de hazañas épicas (Zeus y la Titanomaquia, los 8 trabajos de Hércules de Zurbarán del Prado, Perseo petrificando a Fineo de Luca Giordano, Prometeo encadenado de Rubens, el Tártaro de Tiziano, la Ilíada y la Odisea).
- **Ingreso de 8 obras nuevas de `dark_art`:** Goya *Dos viejos comiendo sopa*, El Bosco *Panel del Infierno*, Bruegel *Caída de los ángeles rebeldes* (10.000 px), Caravaggio *La sepultura de Cristo* (13.000 px / 115 MP), *Cristo a la columna* y *Salomé*, John Martin *Pandemonium*, Luca Signorelli *Los condenados al infierno*.
- **Tooling nuevo:** `tools/migrate-greek-sculptures.mjs`, `tools/integrate-dark-art.mjs`, `tools/harvest-{18-sculptures,01-paintings,01-epic-myths,19-canevari,20-kubin,21-gonsalves}.mjs`, `tools/targets-*.mjs`, `tools/desc/{18,19,20,21}.mjs`.

### Changed
- **8 Upgrades masivos de resolución:** Aplicados sobre obras existentes desde `dark_art` (destacando la corrección histórica de Goya *Saturno devorando a su hijo*, sustituyendo el boceto a tiza por el óleo mural del Prado; Friedrich *Monje junto al mar* a 3500 px; Caravaggio *Crucifixión de San Pedro* a 10.537 px; Bruegel *El triunfo de la Muerte* en master del Prado; Rubens *Matanza de los inocentes* en 7120 px).
- `tools/remove-work.mjs`: Adaptado para parsear y remover limpiamente fichas formateadas en multilínea sin desfasar `tools/desc/`.
- `tools/apply-desc.mjs`: Adaptado para aceptar prefijos numéricos de colección (`01`, `18`, etc.).
- Contratos actualizados en `AGENTS.md` (rango 01–15, 18–21), `docs/INVENTARIO.md`, `docs/DESCRIPCIONES.md` y `docs/METODO.md`.

### Removed
- Carpeta externa `C:\Users\Usuario\Desktop\Draco\dark_art` enviada de forma segura a la Papelera de Reciclaje de Windows tras verificar la ingesta íntegra.

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
