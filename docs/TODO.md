# TODO — Arte

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en CHANGELOG y git). Header de 1 línea, sin narrativa de sesión.

2026-11-02 — ver SESSION_HANDOFF.md

## 🔴 Crítico
- [ ] Ninguno abierto. (El riesgo de pérdida irreversible por `prune-*`/`dore-dedup` se cerró: ahora mueven en vez de borrar y existe `remove-work.mjs`.)

## 🟠 Importante
- [ ] **Resultado de la revisión visual de fichas vs imagen (547 obras sin `qid`, 2026-11-02, 3 subagentes + verificación propia; Doré excluido). Nada se modificó; decide Guido.**
  - **Error real:** `15 n12` — la imagen es *Violet, Black, Orange, Yellow on White and Red* (1949), no *Orange Red Yellow* (1961) como dice la ficha (WikiArt, 700×865). Corregir la ficha a la obra real o conseguir la correcta.
  - **Dato dudoso:** `04 n55` Friedrich (Turgenev/Zhukovsky): año de la ficha c1799, su archivo Commons dice 1827; la imagen no parece un retrato.
  - **Autor con basura de metadatos (se ve en pantalla):** `01 n58` ("…and Flickr user…"), `03 n37` ("Oursana, 2022"). Revisar el campo `artist` de todo el catálogo.
  - **Fotos rotadas 90°:** `18 n16, n27, n32, n39` (y n40 solo muestra el pedestal). No se editan imágenes: conseguir otra versión o aceptar.
  - **Mockups / fotos de sala en vez de la obra:** `19 n11–15`, `23 n8, n18, n20`; **pósters con rótulo:** `21 n7, n22`; **portadas de libro:** `20 n38, n41`.
  - Descartado tras verificar: `01 n56/n60` no son repetidas (dos piezas distintas del British Museum). Otras dudas del revisor (01 n47, 04 n42, 18 n27/n33) quedan sin confirmar.
- [ ] **Drive bloqueó la 1ª sincronización masiva de la app (2026-11-02):** error 403 anti-abuso de Google en descargas por enlace público (originales de ~5 MB × 1382 obras). Lo trata el agente de la app (bajar más lento, frenar solo). Del lado curaduría: no tocar Drive por API ni links, solo por la carpeta montada; si persiste, exportar copias reducidas (`export-drive --max-side=3840`, ~3–5× más livianas) y/o galerías de a poco.
- [ ] **Fichas vs imagen — barrido parcial hecho 2026-11-02:** se comparó `title_es` con las etiquetas de Wikidata de las 835 obras con `qid`; el único desfase real fue `10_realismo` n30–40 (fichas corridas un lugar tras sacar una obra; corregido, y la 40 *El pensador* tenía ficha de otra obra). `audit` NO detecta esto. Queda sin revisar: las ~547 obras sin `qid` (13–15, 17, 19–23 y parte de 01–06). Revisar además `holding_museum`/`type` de n40 (Rodin: quedó "Alte Nationalgalerie", dato de Wikidata sin verificar).
- [ ] **Decisión de Guido — licencias y link público:** ~198 obras con copyright/uso personal (19–23 y modernas). ¿Van a `Galerías/` pública, o solo compartidas con la cuenta de la TV? (`docs/FORMATO_DRIVE.md`). Bloquea el exportador.
- [ ] **Drive `Galerías`:** las 23 colecciones están exportadas (originales; solo Eakins *Wrestlers* reducido a 3840 px por el límite de 50 MB). Pendiente: confirmar que Drive terminó de subir a la nube y que la app muestra todas; decidir si se pasa a copias de 3840 px (`export-drive --max-side`). Fichas cortas por decisión de Guido; curaduría = él borra después.
- [ ] **Fichas para la app** (`docs/FICHAS_APP.md`, `node tools/fichas-stats.mjs`): solo una fracción llega a 80 palabras; reescribir primero las `Wikipedia-es` y las <60 palabras de las galerías que Guido elija. Decidir niveles y si se investigan `vida_autor`/`medidas`.
- [ ] **Parchear los harvesters para que registren sus rechazos** (`logDiscard`): hoy no lo hacen `canon`, `wikiart`, `sculptures` ni `harvest-*`; solo 8 de 23 colecciones tienen historial en `_descartes/` (`_candidatas.json` lo declara en `cobertura`). Y revisar los 37 pendientes de los `_candidatas.json` con Guido.
- [ ] **Motor genérico de colección nueva:** hoy cada colección se armó copiando `targets-NN` + `harvest-NN` de la anterior (`docs/procesos/NUEVA_COLECCION.md` paso 2). Un `tools/harvest.mjs` que lea un archivo de targets evitaría el copy-paste.
- [ ] **Google Drive:** desmarcar "abrir al iniciar el sistema"; confirmar que la subida del Respaldo terminó; probar `images-sync restore` en la otra PC.
- [ ] **Reorganizar el repo:** mover colecciones a `colecciones/` (las herramientas ya lo toleran) y agrupar `tools/` (56 scripts; varios de una sola pasada). Esperar a ver la app pulida; las obras se referencian por `qid`/`sourceId`.
- [ ] **Decidir qué hacer con los `.jpg` que en realidad son PNG/WebP** (`node tools/audit.mjs --all` → `W-EXT`). Algunos visores/TV pueden rechazarlos. Renombrar a la extensión real no toca los píxeles pero cambia `file` y exige actualizar el índice. **Decisión del usuario.**
- [ ] **`_dedup_removed/` de la 17 (grabados duplicados apartados, cientos de MB):** decidir si se borra definitivamente. Están fuera de git. Borrar esa carpeta es seguro ahora (el script que la usaba aborta siempre).
- [ ] **Retirar o parametrizar `prune-canon.mjs`/`prune-modern.mjs`:** en dry proponen sacar obras ya aceptadas (excepciones de `docs/CALIDAD.md` §4) y renumeran (desfasa `tools/desc/`). Hoy son "una pasada, no re-correr"; el camino normal es `remove-work.mjs`.
- [ ] **Obras bajo el piso de revisión** (`audit` → `W-RES`; p. ej. *Romeo y Julieta* de Wright 750 px, *Escena pastoril* de Puvis de Chavannes ~500 px): buscar mejor versión o aceptar y dejarlo escrito en `docs/CALIDAD.md` §4 (hoy esa lista de excepciones no es completa: cada `W-RES` debería quedar justificado o corregido).
- [ ] **Busto de Nefertiti (05):** la foto de Berlín es de licencia restringida (sin P18 usable) → buscar alternativa PD/CC0 o aceptar que no entra. Es problema de licencia, no de resolución.
- [ ] **Modernas con copyright sin alta resolución:** Frida Kahlo, Lichtenstein (*Whaam!*, *Drowning Girl*), Warhol *Marilyn*, Pollock *Autumn Rhythm*, Dalí *Cristo de San Juan*, O'Keeffe *Ram Skull*. Best-effort con navegador, obra por obra.
- [ ] **Prueba real con otros agentes (te toca a vos, ~1 min c/u):** en Gemini CLI `/memory show` debe mostrar el contenido de `AGENTS.md`; en OpenCode preguntar "¿cuáles son las trampas del proyecto?" debe responderlas sin leer más. Los pasos de carga de contexto de cada agente salieron de guías de terceros (no se pudo probar acá: no hay otro agente instalado).

## 🟡 Cuando se pueda
- [ ] **`apply-desc` pega por `n`:** reescribir `tools/desc/NN.mjs` para que se claven por `qid`/`sourceId` (hoy `W-DESC-STALE` solo avisa).
- [ ] **`qid` genérico repetido en 01–06** (`W-QID-DUP`: p. ej. varias "Madonna and Child" comparten `qid`): revisar si hay duplicados reales y dejar de usar `qid` como clave de dedup para obras `named`/`discovery`.
- [ ] **Las obras de WikiArt (13–15) no tienen `sourceId` ni `qid`**: su dedup es débil (solo título-apellido dentro de la colección).
- [ ] **`dore.mjs`**: agregar `r.ok` + validación de contenido, o marcarlo obsoleto/abortar como `gap-desc`. Hoy no hay que re-ejecutarlo.
- [ ] **`_descartes/` incompleto:** loguean `collect`, `discover`, `dore-dedup*` y `remove-work`; no loguean `canon`, `wikiart`, `sculptures` ni `prune-*`.
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
