# TODO — Arte

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en CHANGELOG y git). Header de 1 línea, sin narrativa de sesión.

2026-10-15 — ver SESSION_HANDOFF.md

## 🔴 Crítico
- [ ] Ninguno abierto. (El riesgo de pérdida irreversible por `prune-*`/`dore-dedup` se cerró: ahora mueven en vez de borrar y existe `remove-work.mjs`.)

## 🟠 Importante
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
