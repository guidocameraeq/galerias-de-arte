# TODO — Arte

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en CHANGELOG y git). Header de 1 línea, sin narrativa de sesión.

2026-11-04 — ver SESSION_HANDOFF.md

## 🔴 Crítico
- [ ] Ninguno abierto. (El riesgo de pérdida irreversible por `prune-*`/`dore-dedup` se cerró: ahora mueven en vez de borrar y existe `remove-work.mjs`.)

## 🟠 Importante
- [ ] **25 Doré (resto): revisar fichas dudosas** (ver `docs/galerias/25_dore_otras_obras.md`), conseguir *La Libertad* (Cleveland, solo hay TIFF en Commons) y reproducción limpia del *Cristo abandonando el pretorio*.
- [ ] **Revisión de datos (Guido, 2026-11-04) — 1ª pasada hecha** con `tools/meta-fix.mjs` (overlay `tools/meta/<col>.json`, lo aplica `apply-desc`; tabla `tools/meta/museos-fijos.mjs`): 1.107 obras con museo "Museo, Ciudad, País", 42 en colección privada, años normalizados ("c. 1625", "350 a. C."), 4 autores con basura corregidos. **2ª pasada (2026-11-05):** revisadas las 107 discrepancias de Wikidata (casi todas eran ubicación histórica o `qid` genérico: el museo actual estaba bien); corregidas 12 obras que decían "National Gallery" y son de Tate Britain, la *Alba Madonna* (NGA Washington, no Hermitage), *Dánae* (Capodimonte, no Prado), el Ribera de Bruselas, *Isla de los muertos III* (Berlín), Malevich (colección privada) y se completó el país en ~25. **Quedan:** composites con "/" (01 n76/n142/n147, 20 n42, 19/23 colecciones privadas), 06 n24 y 16 n29 (¿Compiègne o Versalles?), 08 n58 *Pequeña bailarina* (¿versión NGA u Orsay?); ~100 obras sin museo (WikiArt 13–15, parte de 01–12); fichas vs imagen de las ~547 obras sin `qid` (ver abajo). **No volver a correr `meta-fix` sin mirar el dry-run:** es acumulativo por campo.
- [ ] **Carpeta personal de Guido (`1. Arte`):** ya se incorporaron 15 obras + 3 reemplazos; falta que Guido borre esas 18 (el agente no pudo borrar fuera del proyecto) y decida el resto. Bocetos que quedaron afuera: Chepstow, Arkona, *Juicio Final (estudio)*.
- [ ] **17: revisar a 100%** el borde de la plancha 46 y las fichas `dudoso` (74, 125, 126, 132, 133); varias fichas están algo bajo las 80 palabras (74–79).
- [ ] **24 Ukiyo-e, n8 *Nieve nocturna en Kanbara*:** Cleveland la cataloga "after Hiroshige" (posible impresión posterior o copia). Decidir si queda o se reemplaza por una impresión de época (Met/Rijksmuseum).
- [ ] **Resultado de la revisión visual de fichas vs imagen (547 obras sin `qid`, 2026-11-02, 3 subagentes + verificación propia; Doré excluido). Nada se modificó; decide Guido.**
  - (Corregidos 2026-11-04: `15 n12` ahora es la obra real, *Sin título (Violeta, negro, naranja…)* 1949, Guggenheim; autores de `01 n58`, `02 n61`, `03 n37/n45`, `05 n31`.)
  - **Dato dudoso:** `04 n55` Friedrich (Turgenev/Zhukovsky): año de la ficha c1799, su archivo Commons dice 1827; la imagen no parece un retrato.
  - **Fotos rotadas 90°:** `18 n16, n27, n32, n39` (y n40 solo muestra el pedestal). No se editan imágenes: conseguir otra versión o aceptar.
  - **Mockups / fotos de sala en vez de la obra:** `19 n11–15`, `23 n8, n18, n20`; **pósters con rótulo:** `21 n7, n22`; **portadas de libro:** `20 n38, n41`.
  - Descartado tras verificar: `01 n56/n60` no son repetidas (dos piezas distintas del British Museum). Otras dudas del revisor (01 n47, 04 n42, 18 n27/n33) quedan sin confirmar.
- [ ] **Drive bloqueó la 1ª sincronización masiva de la app (2026-11-02):** error 403 anti-abuso de Google en descargas por enlace público (originales de ~5 MB × 1382 obras). Lo trata el agente de la app (bajar más lento, frenar solo). Del lado curaduría: no tocar Drive por API ni links, solo por la carpeta montada; si persiste, exportar copias reducidas (`export-drive --max-side=3840`, ~3–5× más livianas) y/o galerías de a poco.
- [ ] **Fichas vs imagen — barrido parcial hecho 2026-11-02:** se comparó `title_es` con las etiquetas de Wikidata de las 835 obras con `qid`; el único desfase real fue `10_realismo` n30–40 (fichas corridas un lugar tras sacar una obra; corregido, y la 40 *El pensador* tenía ficha de otra obra). `audit` NO detecta esto. Queda sin revisar: las ~547 obras sin `qid` (13–15, 17, 19–23 y parte de 01–06). Revisar además `holding_museum`/`type` de n40 (Rodin: quedó "Alte Nationalgalerie", dato de Wikidata sin verificar).
- [ ] **Drive `Galerías`:** las 24 colecciones están exportadas (originales; solo Eakins *Wrestlers* reducido a 3840 px por el límite de 50 MB). Pendiente: confirmar que Drive terminó de subir a la nube y que la app muestra todas; decidir si se pasa a copias de 3840 px (`export-drive --max-side`). Fichas cortas por decisión de Guido; curaduría = él borra después.
- [ ] **Fichas para la app** (`docs/FICHAS_APP.md`, `node tools/fichas-stats.mjs`): solo una fracción llega a 80 palabras; reescribir primero las `Wikipedia-es` y las <60 palabras de las galerías que Guido elija. Decidir niveles y si se investigan `vida_autor`/`medidas`.
- [ ] **Revisar con Guido los 41 pendientes de los `_candidatas.json`.** Solo 8 colecciones tienen historial de descartes (las viejas vías `canon`/`wikiart`/`sculptures`/`harvest-NN` no registraban); lo nuevo con `harvest.mjs` sí registra todo.
- [ ] **Google Drive:** desmarcar "abrir al iniciar el sistema"; confirmar que la subida del Respaldo terminó; probar `images-sync restore` en la otra PC.
- [ ] **Agrupar `tools/`** (66 scripts; varios de una sola pasada: `dore*`, `prune-*`, `gap-desc`, `move-aphrodite`, `harvest-NN-*` viejos): moverlos a `tools/legacy/`. Las colecciones ya están en `colecciones/` (2026-11-04).
- [ ] **Decidir qué hacer con los `.jpg` que en realidad son PNG/WebP** (`node tools/audit.mjs --all` → `W-EXT`). Algunos visores/TV pueden rechazarlos. Renombrar a la extensión real no toca los píxeles pero cambia `file` y exige actualizar el índice. **Decisión del usuario.**
- [ ] **`_dedup_removed/` de la 17 (grabados duplicados apartados, cientos de MB):** decidir si se borra definitivamente. Están fuera de git. Borrar esa carpeta es seguro ahora (el script que la usaba aborta siempre).
- [ ] **Retirar o parametrizar `prune-canon.mjs`/`prune-modern.mjs`:** en dry proponen sacar obras ya aceptadas (excepciones de `docs/CALIDAD.md` §4) y renumeran (desfasa `tools/desc/`). Hoy son "una pasada, no re-correr"; el camino normal es `remove-work.mjs`.
- [ ] **Obras bajo el piso de revisión** (`audit` → `W-RES`; p. ej. *Romeo y Julieta* de Wright 750 px, *Escena pastoril* de Puvis de Chavannes ~500 px): buscar mejor versión o aceptar y dejarlo escrito en `docs/CALIDAD.md` §4 (hoy esa lista de excepciones no es completa: cada `W-RES` debería quedar justificado o corregido).
- [ ] **Obras importantes que faltan** (Nefertiti, Frida Kahlo, Warhol, Lichtenstein, Pollock, O'Keeffe, Dalí, el Rothko de 1961…): ya no se listan acá, viven en `colecciones/NN/_candidatas.json` (estado `pendiente`). Best-effort obra por obra.
- [ ] **Prueba real con otros agentes (te toca a vos, ~1 min c/u):** en Gemini CLI `/memory show` debe mostrar el contenido de `AGENTS.md`; en OpenCode preguntar "¿cuáles son las trampas del proyecto?" debe responderlas sin leer más. Los pasos de carga de contexto de cada agente salieron de guías de terceros (no se pudo probar acá: no hay otro agente instalado).

## 🟡 Cuando se pueda
- [ ] **`qid` genérico repetido en 01–06** (`W-QID-DUP`: p. ej. varias "Madonna and Child" comparten `qid`): revisar si hay duplicados reales y dejar de usar `qid` como clave de dedup para obras `named`/`discovery`.
- [ ] **Las obras de WikiArt (13–15) no tienen `sourceId` ni `qid`**: su dedup es débil (solo título-apellido dentro de la colección).
- [ ] **`dore.mjs`**: agregar `r.ok` + validación de contenido, o marcarlo obsoleto/abortar como `gap-desc`. Hoy no hay que re-ejecutarlo.
- [ ] **`_descartes/` incompleto en las colecciones viejas** (las armadas con `canon`, `wikiart`, `sculptures`, `prune-*` no registraban); lo nuevo con `harvest.mjs` sí registra todo.
- [ ] **Script para recuperar una obra apartada** (devolver el archivo desde `_dedup_removed/` y reinsertar el item): hoy es a mano.
- [ ] **`title_es` faltante** en parte de 01–04 y del canon (cosmético: se muestra `title`). Falta un script que liste las que quedaron en inglés.
- [ ] `holding_museum` vacío en parte de las modernas (13–15); 2 Schiele (col 13) rozan el piso (PD, mejorables vía Wikidata).
- [ ] Las descripciones `Wikipedia-es:` son un piso, no el estándar (repiten título/año/museo): reescribir a mano las obras clave.
- [ ] `n` con huecos (`W-N-GAP`): es válido; solo recordar que `items.length ≠ max(n)`.

## 🟢 Ideas / algún día
- [ ] **Proyecto aparte, DESPUÉS de cerrar la curaduría: visor/caption para la TV.** (A) copias con el texto quemado en `_captioned/` (sharp, ya instalado); (B) visor HTML casteable con globito flotante que lee `_index.json` en vivo y filtra por autor/museo/año sin duplicar carpetas. Criterio de diseño: el globito es **chico, no debe molestar**; ficha = `título · año — autor · escuela — técnica · museo` en una línea + el párrafo largo guardado aparte. No empezar sin pedido del usuario.
- [ ] Lock técnico de "un solo escritor" sobre `_index.json`.
- [ ] Que el cierre corra `node tools/audit.mjs` por hook (hoy lo corre el agente al seguir `docs/procesos/CIERRE.md`).
- [ ] Atajos nativos `/inicio` y `/cierre` para Gemini/OpenCode (solo si los usás 3+ veces; con las palabras clave alcanza).
- [ ] Sumar fuentes nunca implementadas (AIC, Rijksmuseum, NGA, Smithsonian) si hiciera falta.
