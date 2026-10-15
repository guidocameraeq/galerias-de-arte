# DESCRIPCIONES — cómo se hacen las fichas de las obras

> Hub: `AGENTS.md` · Método: `docs/METODO.md` · Calidad: `docs/CALIDAD.md` · Fuentes: `docs/FUENTES.md` · Scripts: `tools/README.md`.
> Cobertura/estado: **no está acá** → `node tools/audit.mjs` (`W-DESC` = descripción vacía; `W-DESC-STALE` = `tools/desc/<col>.mjs` desfasado respecto del índice; NO detecta títulos en inglés).
> Verificado contra código y datos el 2026-10-15. Si el código discrepa con este doc, manda el código.

## 1. Qué es una ficha
Es el registro de la obra en `<colDir>/_index.json` (`{collection, items:[...]}`, objeto, no array). Sirve para el futuro "globito"/caption de la TV: `title_es·year — artist · school — type · holding_museum` + `description`.

| Campo | Qué es | Quién lo llena |
|---|---|---|
| `title` | Título base. En canon (Wikidata) ya viene en español si existía la etiqueta `es` (`canon.mjs:46`, `"es,en"`); si no, en inglés | descarga (`collect.mjs`/`canon.mjs`) |
| `title_es` | Título curado en español. **Puede faltar**: ahí mostrar `title_es \|\| title` (así lo hace `audit.mjs:84`) | `apply-desc` (`titulo`), `gap-desc`, `dore-desc` |
| `year` (string), `artist` | Año / autor | descarga; `year` se corrige con `anio` en `apply-desc`; `artist` solo a mano/script |
| `school`, `type` | Escuela/época y técnica. `type` puede ser `null` | `wikidata-enrich` (P135/P186); curado pisa vía `apply-desc` (`escuela`/`tipo`) |
| `holding_museum` | Museo real que se muestra. **No confundir con `museum`** (= fuente de descarga: "The Met", "Wikidata/Commons"; no mostrar) | `wikidata-enrich`; curado vía `apply-desc` (`museo`) |
| `museum_confidence` | `fuente` (Met/Cleveland/AIC, seguro) · `wikidata` · `wikidata?` · `falta` | `wikidata-enrich.mjs:80-81` |
| `qid`, `canon_rank` | QID Wikidata; rank = nº de sitelinks | `wikidata-enrich` / `canon.mjs` |
| `description` | Texto en español | los 3 caminos (§2) |
| `description_source` | Trazabilidad **y marca de "ya fichada"** (los scripts saltan lo que lo tiene) | cada camino |
| `canto` | Solo col 17 | `dore-desc` |
| `image_quality` | Aviso de baja resolución (no es de la ficha, pero `gap-desc` lo setea con `q`) | varios |

`description_source` vale hoy: `Síntesis (Claude, fundada en Wikipedia/curatoría)` (a mano), `Wikipedia-es: <título del artículo>` (`enrich-es`), `Síntesis (Claude, sobre la Divina Comedia)` (col 17). Marcadores de pendiente: `(sin artículo es)` (`enrich-es.mjs:40`), `(sin canto)`/`(canto sin texto)` (`dore-desc.mjs:81,88`), `(sin descripción)` (legado).

## 2. Los 3 caminos — la fuente de verdad de cada uno (TRAMPA REAL)
Siempre correr desde la **raíz del repo** (`loadIndex` usa rutas relativas al cwd, `lib.mjs:203`). Orden histórico del flujo: `wikidata-enrich` → `enrich-es` → `apply-desc`; el curado va **último** para que gane.

### A. Colecciones 01–15 (y 3 obras de la 16): AUTORADO a mano
- **Fuente de verdad:** `tools/desc/<colDir>.mjs` → `export default [{ n, titulo?, anio?, museo?, escuela?, tipo?, d }]`.
- Volcar: `node tools/apply-desc.mjs <colDir>` (dry) y luego `... --apply`.
- Escribe por entrada (`apply-desc.mjs:17-26`): `description` + `description_source` fijo (solo si hay `d`); y si vienen: `title_es`, `year`, `holding_museum`, `school`, `type`. Avisa (no corta) si `d` > 620 car. (`:18`). Reporta `#n no existe` si el `n` no está en el índice (`:16`). Nunca toca `artist`, `qid`, `museum_confidence`.
- **Editar `description` directo en `_index.json` se PIERDE** en el próximo `apply-desc` de esa colección. Editá el `.mjs` y re-aplicá.
- **PELIGRO — el match es por `n`, no por obra.** Si después de escribir el `.mjs` se podó/renumeró/movió algo, `apply-desc` pega la descripción **equivocada** en la obra del `n` actual. El 2026-10-15 había tres desfasados (`desc/01` n10 = Venus de Rokeby ya reemplazada por la Afrodita, `desc/02` n40 = obra eliminada, `desc/11` desde n17 = 22 fichas corridas porque `prune-canon` sacó dos obras) y se **corrigieron**: se borraron las entradas de obras que ya no existen y se renumeró la 11 por coincidencia exacta de texto + título. **`node tools/audit.mjs` avisa `W-DESC-STALE` si vuelve a pasar.** Regla: tras cada poda/renumeración/movida corré `audit`; si avisa, corregí el `.mjs` ANTES de cualquier `apply-desc`. Y al borrar o mover una obra, sacá también su entrada de `desc/` (si no, la próxima obra con ese `n` hereda su texto). Chequeo manual equivalente (imprime `FALTA`/`DIFIERE`; vacío = sincronizado; ejecutar con `<colDir>` al final):
```
node --input-type=module -e "import fs from 'fs';const c=process.argv[1];const d=(await import('./tools/desc/'+c+'.mjs')).default;const m=new Map(JSON.parse(fs.readFileSync(c+'/_index.json','utf8')).items.map(i=>[i.n,i]));for(const e of d){const i=m.get(e.n);if(!i)console.log('FALTA n',e.n);else if(e.d&&e.d!==i.description)console.log('DIFIERE n',e.n,i.title_es||i.title)}" 11_rococo
```
- Existe `desc/16_neoclasicismo.mjs` (3 entradas) aunque `tools/README.md` dice "01…15".

### B. 16 y gap-fill del canon (07, 10, 12, 13…): QID → es.wikipedia, + retoques
1. `node tools/wikidata-enrich.mjs <colDir> [--apply] [--limit=N]` pobla `qid`, `holding_museum`, `type`, `school`, `canon_rank` (match **por título**, verifica autor por apellido; `:34-66`). **Con `--apply` pisa `type`/`school` de toda la colección cuando Wikidata trae valor** (`:84`, `r.type || it.type`): si había curado en `desc/`, re-aplicalo después (y ver el peligro de A).
2. `node tools/enrich-es.mjs <colDir> [--apply] [--force]`: `qid` → sitelink exacto `eswiki` (`:30-31`) → `es.wikipedia.org/api/rest_v1/page/summary/<título>` → texto ≤500 car. (`shorten`, `:11`). Sin búsqueda por título = sin mislabel. Idempotente: **salta lo que ya tiene `description_source`** (`:24,38`); dry por defecto; con `--apply` guarda tras cada obra (`:44`). Sin QID/artículo deja `description=''` y `(sin artículo es)` (`:40-42`).
   - **PELIGRO `--force`:** reprocesa TODA la colección y sobrescribe con el extracto de Wikipedia —o con `''`— las descripciones autoradas a mano (`:24,42`). No usar `--force` en colecciones con `Síntesis`.
3. `tools/gap-desc.mjs`: parche puntual ya aplicado (sin dry-run, pegaba por `n`, borraba el archivo de 07 #50). **Hoy aborta al ejecutarse**; su `DATA` queda como registro histórico. Para fichar más obras: `tools/desc/<col>.mjs` + `apply-desc` (§2.A).

### C. Colección 17 (Doré): hardcodeado por canto
`node tools/dore-desc.mjs` — **sin dry-run ni `--apply`**. Lee `17_dore_divina_comedia/_cantos.json` (`sourceId → "Inferno 3"`) y la tabla `CANTOS` (`dore-desc.mjs:11-74`, una descripción por canto). Escribe `title_es = "Infierno · Canto III"` (español + número romano; **no** "Cántica": `:83`), `canto`, `description`+fuente. Además **ordena, renumera y renombra archivos en disco** (`:91-103`). Todas las láminas de un mismo canto comparten el mismo texto (esperado). Antes de re-correr: copiar `_index.json` y la carpeta; correrlo tras `dore-dedup-apply.mjs`, no antes.

### Legado: `tools/enrich-desc.mjs`
Fase 1, descripciones en **inglés** (Cleveland → Wikipedia en → Met → Commons). No lo invoca ningún script y ninguna obra actual tiene sus fuentes en `description_source`. **No usar** para fichar; solo referencia histórica.

## 3. Guía de estilo (derivada de ~30 descripciones de `tools/desc/*` de 01–15)
- **Español**, 3 frases (693/702 de las autoradas), 135–474 car., mediana ~205; tope duro 620. Texto plano, sin markdown, comillas rectas `"`.
- **Orden:** (1) qué se ve/qué pasa, en presente, empezando por la escena, no por el título; (2) apellido del artista + qué hace o por qué importa ("Caravaggio vuelve la vocación un drama cotidiano"); (3) **frase-síntesis corta nominal** de cierre ("El acta de nacimiento de la pintura moderna.", "Soledad en el camino.").
- **Enfoque: qué muestra y qué significa**, con una anécdota/dato que enganche (escándalo, robo, encargo) si es verificable. Mito/relato en la escena, no en la ficha de museo.
- **No repetir lo que ya está en el caption**: título, año, museo, técnica, dimensiones, "es una pintura de…".
- **Bueno 1** — `04_romanticismo` n1: «Un hombre de espaldas, en la cima de una roca, contempla un mar de niebla del que emergen montañas. Friedrich convierte al espectador en ese caminante frente a lo infinito: la imagen suprema del individuo ante la inmensidad. Ícono absoluto del Romanticismo.»
- **Bueno 2** — `08_impresionismo` n1: «El puerto de Le Havre al amanecer, disuelto en bruma anaranjada y reflejos rápidos; un sol naciente flota sobre el agua. De su título nació, en burla de un crítico, el nombre del movimiento: "impresionismo". El cuadro que bautizó una revolución.»
- **Anti-ejemplo (qué NO hacer)** — `02_barroco` n75 (extracto crudo de Wikipedia-es): «La novia judía es una obra del pintor holandés Rembrandt pintada en 1666. Está expuesta de forma permanente en el Rijksmuseum de Ámsterdam.» → repite título/año/museo, cero significado. Los `Wikipedia-es:` son un **piso aceptable**, no el estándar: las obras clave se reescriben a mano.

## 4. Regla de veracidad
- Se **sintetiza desde fuentes** (extracto es.wikipedia, texto curatorial del museo), **nunca de memoria**. Cada ficha lleva `description_source`; si el texto cambia de origen, cambiá también la fuente.
- Fuente pobre ⇒ quedarse **factual y corto** (qué se ve + autor), sin inventar anécdotas ni atribuciones. Obras oscuras: foco en el mito/escena (`desc/01` cabecera).
- `apply-desc` pone siempre la misma etiqueta `Síntesis (Claude, fundada en Wikipedia/curatoría)`: no distingue cuán fundada está; la honestidad depende de quien escribe. Las descripciones no tuvieron revisión humana obra por obra (`CALIDAD.md:84`).
- Los extractos `Wikipedia-es` derivan de texto CC BY-SA: OK para uso personal; si algún día se publica, atribuir.

## 5. Procedimiento para fichar una obra nueva
1. Poné la obra en el índice con su descarga (`docs/METODO.md`); sin `description_source` queda "pendiente" para los scripts.
2. ¿Tiene `qid`? Si no y es famosa: `wikidata-enrich` en dry y revisá `verified`/museo (match por título: puede traer homónimo). Si no hay `qid` y la obra es clave, no hace falta: escribí la ficha a mano en `tools/desc/` (para eso el `qid` no es necesario; nunca edites el índice a mano).
3. `node tools/enrich-es.mjs <colDir>` (dry): ¿hay `Wikipedia-es: …` para ese `n`? Si sí y no es obra clave → `--apply` (sin `--force`; solo toca las pendientes).
4. Si es obra clave, o `(sin artículo es)` / sin `qid`: escribí a mano `{ n, titulo, escuela, tipo, d }` al final de `tools/desc/<colDir>.mjs` siguiendo §3, con base en una fuente leída (no memoria).
5. Corré el chequeo de desfase de §2.A. Si imprime algo, **arreglá el `.mjs` primero**.
6. `node tools/apply-desc.mjs <colDir>` (dry; mirá avisos de >620) y luego `--apply`.
7. Sin artículo y sin fuente confiable: ficha mínima factual (autor + qué muestra), `description_source` honesto; nunca dejar el texto de otra obra.
8. Verificá con `node tools/audit.mjs --col=NN` (sin `W-DESC`, `W-N-GAP` esperable tras podas).

## 6. Casos especiales y trampas
- **Metadatos junto con la ficha:** `apply-desc` acepta `titulo`/`anio`/`museo`/`escuela`/`tipo` (corrige años errados de Wikidata, museo ambiguo, etc.). Para corregir `artist`, `qid` o mover de colección hay que script aparte.
- **Museo ambiguo (varias versiones de la obra):** el museo seguro viene de la fuente de descarga (`SRC_MUSEUM`, `wikidata-enrich.mjs:69-73`); el de Wikidata solo si verificó autor (`wikidata?`) y puede ser otra versión. Forzar con `museo` en `desc/`. Mirar `museum_confidence` antes de confiar.
- **Autor mal atribuido por Wikidata:** *Afrodita de Siracusa* figuraba como "Antonio Canova" (es grecorromana anónima). `tools/move-aphrodite.mjs` (dry por defecto, `--apply`) corrigió autor→Anónimo, escuela, descripción y la movió de 16 n37 a 01 n10 (`:26-39`). Dejó `desc/01` n10 con el texto de la Venus de Rokeby (**corregido 2026-10-15**: se borró esa entrada; ver §2.A). Sospechar de esculturas antiguas atribuidas a un neoclásico.
- **Títulos pendientes:** muchas canon no tienen `title_es` porque `title` ya está en español (etiqueta Wikidata `es`); solo quedan en inglés las que cayeron al fallback `en` (heurística rápida: p. ej. 07 "Woman with a Mirror"). Sin script que las liste: [NO VERIFICADO] el total; agregar `titulo` en `desc/` al fichar.
- **Doré:** ver §2.C; todas sin museo/año por grabado (`holding_museum` nulo), fuente `Síntesis … Divina Comedia`.
- **Nunca** guardar descripciones de una obra homónima: por eso `enrich-es` va por QID y no por título.
- `loadIndex` (`lib.mjs:203`) devuelve índice vacío solo si el archivo NO existe; si el JSON está roto **lanza** (corregido 2026-10-15: antes devolvía vacío y el siguiente `saveIndex` pisaba la colección entera). Si lanza, reparar el `_index.json` (hay copia en git) antes de seguir.
