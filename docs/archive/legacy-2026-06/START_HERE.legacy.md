# 🎨 START_HERE — Proyecto "Arte"

> Punto de entrada de 30 segundos. Leé esto y después abrí los docs en orden.

## Qué es
Biblioteca **curada** de obras de arte en **ALTA RESOLUCIÓN** para **uso personal** del usuario
(las mira como slideshow / modo reposo en su TV, estilo Google Slideshow). Motor **100% Node.js**
(no hay Python ni Pillow). Cada obra se baja por APIs abiertas (Met/Cleveland/AIC/Wikimedia/Wikidata)
o WikiArt, se separa por orientación (`landscape/`, `portrait/`) y lleva una **ficha en español**.

## Leé en este orden
1. **`CLAUDE.md`** — la biblia: misión, reglas duras, fuentes, calibraciones técnicas, tooling, log fechado.
2. **`PLAN.md`** — estado por colección + backlog + log de avance.
3. **`tools/README.md`** — índice de TODOS los scripts (qué hace cada uno + comando de uso).

## Estado actual (verificado 2026-06-28)
- **17 colecciones · 1102 obras · ~5,8 GB · 1102 con ficha en español (100%) · 0 huérfanos.**
- **01-06** temáticas (PD/CC0) · **07-12 + 16** canon europeo por fama Wikidata · **13-15** modernas
  s.XX (WikiArt, copyright = uso personal) · **17** Doré · Divina Comedia (**98** grabados full-res, deduplicado).
- Ficha por obra: `title_es · year · artist · school · type · holding_museum · canon_rank · description (es)`.
- **Sesión 2026-06-28:** se rescató la col 17 (los 155 archivos eran **páginas de error HTML** por
  descarga rate-limited → re-bajados full-res) y se **dedup-eó visualmente 155→98** (las ~4 ediciones
  duplicaban planchas; 57 movidos a `17_dore.../​_dedup_removed/`, recuperables). +8 fichas a mano,
  Afrodita de Siracusa corregida (autor falso "Canova"→anónima) y movida 16→01.

## ⚠️ 3 cosas que TENÉS que saber antes de tocar código
1. **`_index.json` es un objeto `{collection, items:[...]}`, NO un array.** Las obras están en `.items`.
   (Usá `JSON.parse(f).items`, no `.filter` sobre el parse directo, o revienta.)
2. **Fuente de verdad de las descripciones 01-15 = `tools/desc/NN.mjs`.** Editá ahí y corré
   `node tools/apply-desc.mjs <col> --apply`. Editar `description` directo en `_index.json` para 01-15
   lo pisa el próximo `apply-desc`. Para 16/17 y gap-fill: `enrich-es.mjs` (QID→es.wikipedia) / `dore-desc.mjs`.
3. **La colección 17 (Doré) es estructuralmente excepcional:** sin `holding_museum`/`year` por grabado,
   `title_es` = "Cántica · Canto N". No la valides con las reglas de ficha del resto.

## Regla de oro
**Pocas obras excelentes > muchas mediocres.** Calidad y relevancia sobre formato. **Nunca** se edita,
recorta ni retoca; no se descarta por aspect ratio (vertical y cuadrada entran igual).

## Lección técnica (sesión 2026-06-28) — IMPORTANTE
**`lib.downloadTo` NO valida que el contenido sea una imagen**: si Wikimedia responde una página de
error (rate-limit 429) con HTTP 200, la guarda como si fuera el `.jpg`. Así se rompieron los 155 Doré.
Para descargas de Wikimedia: **validar magic bytes (FF D8 / PNG) + throttle serial** (ver `dore-redownload.mjs`).
Verificación de integridad project-wide: escanear magic bytes de cada archivo del índice (cazó el bug).

## Qué falta (curaduría) — detalle en `PLAN.md`
- **`_dedup_removed/` (57 grabados Doré, 690 MB):** revisar y decidir si borrar definitivamente o conservar.
- **Romeo y Julieta (Wright)** en 10: el original de Commons es solo 750px (< piso 1000) → buscar mejor versión o aceptar.
- **Busto de Nefertiti** (05): la foto del busto de Berlín está restringida → buscar alternativa PD/CC0 o aceptar que no entra.
- **Modernas con copyright sin alta-res** (Frida Kahlo, Lichtenstein, Warhol Marilyn, Pollock, Dalí, O'Keeffe) → best-effort con navegador (Chrome MCP).
- *(Resuelto 2026-06-28: las 9 sin-descripción · Ernst "Europa…" verificado NO es recorte (formato real 54,8×147,8 cm).)*

## Sub-proyecto FUTURO (NO empezar todavía)
**Visor con "globito flotante"** sobre la imagen, o **copias con caption quemado** (`_captioned/`) para el
modo reposo de la TV. Capa de PRESENTACIÓN. Se hace **al final**, una vez cerrada la curaduría de imágenes.
Hoy no existe tooling para esto.
