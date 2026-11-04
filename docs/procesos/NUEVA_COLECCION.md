# NUEVA_COLECCION — proceso para agregar una colección (o ampliar una)

> Agnóstico de agente (Claude, Gemini, OpenCode…). Es el **checklist único**: si mañana hay que bajar una galería nueva, se sigue esto de arriba a abajo. Reglas duras: `AGENTS.md`. Roles: `docs/procesos/FLUJO_AGENTES.md`. Gates: `docs/CALIDAD.md`. Fichas: `docs/DESCRIPCIONES.md`. Contrato con la app: `docs/FORMATO_DRIVE.md`.
> **Un solo escritor** sobre los `_index.json` (regla 7): descarga y aplica cambios el agente principal. Los subagentes de Claude (`.claude/agents/`) solo leen e informan, o escriben su propio archivo de fichas.
> **Dos frenos con Guido:** (1) aprueba la lista de objetivos (paso 1) y (2) aprueba el dry-run de la descarga (paso 3). Todo lo demás corre solo.

## El circuito en una línea
`investigar → lista de objetivos (JSON) → [OK Guido] → harvest dry-run → [OK Guido] → harvest --apply → audit + revisión visual → fichas → candidatas → documentar → publicar en Drive → cierre`

## Paso 0 — Preparar el terreno
1. `node tools/audit.mjs` en 0 FALLAS **antes** de empezar. `F-MISSING` masivo = esta PC no tiene la biblioteca de imágenes conectada → `docs/ALMACENAMIENTO.md` (`link-images.mjs`; la ruta es **por PC**, nunca va en el repo).
2. Elegir el nombre: `NN_nombre` (siguiente número libre, minúsculas, sin acentos).
3. Acordar con Guido el **alcance en una línea**: ¿tema, movimiento/época o autor? ¿Rango de años? ¿Exclusiones? ¿Techo de obras? (pocas y excelentes).

## Paso 1 — Historiador: investigar el canon ANTES de bajar nada
*(subagente `investigador-curatorial`, solo lee; se pueden lanzar varios en paralelo por subtemas)*
- Qué autores y qué obras son LAS importantes, con una línea de por qué y la fuente. Fama objetiva = sitelinks de Wikidata. Leer antes `docs/galerias/` y los `<col>/_candidatas.json` de colecciones vecinas (qué falta, qué se descartó, qué ya está) para no repetir.
- Qué **NO** entra y por qué (fuera de período, réplica, boceto menor, ya está en otra colección). Lección Kubin: canon primero, recolección después.
- **Salida:** `tools/targets/NN_nombre.json` (plantilla: `tools/targets/_ejemplo.json`). Una obra por entrada:
  `{ "titulo", "autor", "anio", "museo", "escuela", "tecnica", "qid" | "commons" | "url", "fuente", "licencia", "forma", "d", "d_fuente", "aceptar_baja" }`
  - Imagen: preferí `qid` (Wikidata → su imagen de Commons) o `commons` ("File:…"). `url` directa solo para estates/museos sin Commons (monografías, ver `docs/procesos/ADQUISICION_MONOGRAFICA.md`).
  - `d` (ficha en español de una fuente) es opcional acá; si falta, se hace en el paso 5.
  - `forma: "redonda"|"ovalada"` en tondos y medallones. `aceptar_baja: true` solo para una obra icónica que Guido acepta bajo el piso (anotarla en `docs/CALIDAD.md` §4).
- Las obras que el historiador descarta por criterio o sabe que no se consiguen van a `tools/candidatas-manual.json` (paso 6).
- **Freno 1:** mostrarle la lista a Guido y esperar su OK.

## Paso 2 — Registrar la galería
- Agregar `NN_nombre: 'Título visible'` en `tools/galerias.mjs` (nombre de la carpeta en Drive y título en la app).

## Paso 3 — Cosechador: descargar con el motor genérico
*(agente principal)*
1. `node tools/harvest.mjs NN_nombre` → **dry-run**: resuelve cada imagen, mide el tamaño declarado y avisa qué ya existe en otra colección, qué está bajo el piso y qué no tiene imagen. **Freno 2:** mostrárselo a Guido y esperar su OK.
2. `node tools/harvest.mjs NN_nombre --apply`. Crea `NN_nombre/_index.json` si no existe. **Antes**, en una PC con biblioteca externa: `node tools/link-images.mjs --apply` (el motor se niega a bajar si `landscape/`/`portrait/` no son enlaces, para no meter imágenes en el repo).
   El motor: descarga serial con validación de contenido, **mide el archivo real**, aplica el piso (1000 px; 800 en 13–15), clasifica orientación, nombra, escribe el índice incremental, **registra cada rechazo** en `_descartes/`, y si el objetivo trae `d` crea/agrega `tools/desc/NN_nombre.mjs` clavado por id. Es idempotente: se puede volver a correr tras un corte.
3. ¿Fuente rara que el motor no cubre (WikiArt, tiles, serie de grabados)? Usar la vía específica (`docs/METODO.md` §3: `wikiart.mjs`, `canon.mjs`, `dore*.mjs`) o copiar un `harvest-NN-*.mjs`; en ese caso, anotar a mano los rechazos en `tools/candidatas-manual.json`.

## Paso 4 — Verificador de calidad
1. `node tools/audit.mjs --col=NN`: 0 FALLAS; revisar cada AVISO nuevo (`W-RES`, `W-EXT`, duplicados).
2. **Revisión visual obligatoria** (el `audit` NO ve si la ficha corresponde a la imagen): `node tools/contact-sheets.mjs --out=<carpeta temporal> --col=NN_nombre --all-items` → subagente `verificador-visual` (uno por cada 2–3 hojas, en paralelo). Busca: otra obra distinta, **mockups/fotos de sala/marcos**, pósters con texto, portadas, fotos rotadas, repetidas.
3. **El agente principal verifica a ojo cada hallazgo** antes de actuar. Lo que no sirve sale **solo** con `node tools/remove-work.mjs NN_nombre --n=N --why=… --apply` (recuperable, loguea, limpia la ficha).

## Paso 5 — Redactor de fichas
*(subagente `redactor-fichas`: escribe SOLO `tools/desc/NN_nombre.mjs`)*
- Español, **de una fuente** (nunca de memoria), qué muestra y qué significa, **80–150 palabras** (`docs/FICHAS_APP.md`). Cada entrada lleva `id` (qid/sourceId de la obra) además de `n`: así una poda nunca corre las fichas.
- El agente principal aplica: `node tools/apply-desc.mjs NN_nombre` (dry) → `--apply`; después `node tools/audit.mjs --col=NN` (sin `W-DESC-STALE`) y mirar una muestra en hojas de contacto.
- Campos extra si faltan: `node tools/wikidata-enrich.mjs NN_nombre` (museo, técnica, qid).

## Paso 6 — Registro de candidatas (lo que NO entró)
`node tools/candidatas.mjs --gap` (dry) → `--apply`. Regenera `<col>/_candidatas.json` de todas las colecciones: **pendientes** (importantes no conseguidas: targets sin imagen o bajo el piso, famosas de Wikidata que faltan, lista manual) y **descartadas** (duplicadas, baja calidad, fuera de tema, curaduría de Guido), cada una con motivo. Las que entraron NO se duplican: viven en `_index.json`.

## Paso 7 — Documentar
- `docs/galerias/NN_nombre.md` (copiar el formato de una existente) + línea en `docs/galerias/README.md`.
- Si la colección tiene reglas propias (exclusión temática, ficha distinta): una línea en `AGENTS.md` "Trampas" y en `docs/INVENTARIO.md`.

## Paso 8 — Publicar a la app y respaldar (cuando Guido decida)
1. `node tools/export-drive.mjs --col=NN_nombre --out="<Drive>/Galerías de arte/Galerías" --big-max-side=3840` (dry) → `--apply`. Valida JSON, archivos, ids, 50 MB, Markdown; usa la `forma` de los tondos (`tools/forma-tondos.json` o el objetivo).
2. Respaldo de originales: `node tools/images-sync.mjs backup --apply`.
3. Avisar al agente de la app con el nombre exacto de la carpeta. Drive solo por la carpeta montada (nunca API ni links). Obras con copyright de uso personal: solo con decisión expresa de Guido (`FORMATO_DRIVE.md`).

## Paso 9 — Cierre
`docs/procesos/CIERRE.md`: `audit` en 0 FALLAS, handoff, CHANGELOG, TODO, commit y push.

## Después: curaduría de Guido desde Drive
Guido cura **borrando imágenes** de la carpeta `Galerías` en Drive. Para que el repo lo refleje:
`node tools/drive-curation.mjs` (dry: lista lo borrado) → `--apply`: cada obra borrada sale del repo con `remove-work` (recuperable en `_dedup_removed/`, motivo `curaduria`), se regenera su `galeria.json` y el registro de candidatas. `export-drive` nunca vuelve a subir lo que Guido borró. Freno: si falta >30% de una galería (Drive a medio sincronizar) se saltea salvo `--force`.

## Definición de "colección terminada"
- [ ] `tools/targets/NN_nombre.json` aprobado por Guido; galería en `tools/galerias.mjs`.
- [ ] `audit --col=NN` en 0 FALLAS; avisos justificados.
- [ ] Revisión visual hecha, hallazgos verificados y resueltos.
- [ ] Todas las obras con ficha en español de una fuente, clavadas por `id`.
- [ ] `_candidatas.json` regenerado.
- [ ] `docs/galerias/NN_nombre.md` escrito.
- [ ] Respaldo en Drive; exportada a `Galerías` si se publica, y aviso a la app.
- [ ] Handoff/TODO/CHANGELOG al día, commit y push.
