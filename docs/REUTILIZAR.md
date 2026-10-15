# REUTILIZAR — llevar este método a otro proyecto

Para quién: quien quiera armar OTRA biblioteca curada (fotos de arquitectura, mapas antiguos, partituras, lo que sea) con el mismo método, o mejorar este desde acá.
Todo lo que sigue sale de `AGENTS.md` y de los docs de `docs/`; si algo discrepa, mandan el código y los docs de referencia.

## 1. Qué es portable y qué es de arte

| Pieza | ¿Portable? | Qué adaptar |
|---|---|---|
| Pipeline de 7 pasos (adquirir → **medir el archivo real** → limpiar → clasificar → ficha → índice → descartes) | **Sí, tal cual** | Las fuentes del paso 1 (`docs/METODO.md` §2) |
| Contrato de inventario: un índice por colección `{collection, items}`, identidad por id de fuente, nombre `NN_Titulo_Autor_Año`, carpeta física = UN solo eje, el resto son vistas del índice | **Sí** | Campos propios del dominio (`docs/INVENTARIO.md` §3) |
| `tools/audit.mjs` (solo lectura, exit ≠0 si falla) y `tools/remove-work.mjs` (sacar una obra SIN perderla) | **Sí: son las piezas más valiosas** | Constantes de arriba: pisos de resolución, grupos de colecciones, formatos válidos |
| `lib.downloadTo` con validación de magic bytes + reintentos con backoff | **Sí** | Nada (desactivable con `validate:false` para no-imágenes) |
| Dedup visual: hoja de contacto + dHash calibrado + **mover, no borrar** | **Sí** | Umbral: recalibrarlo con pares conocidos de TU material (`docs/CALIDAD.md` §3) |
| Fichas: fuente de verdad en un archivo de datos versionado (`tools/desc/NN.mjs`) + volcado idempotente al índice | **Sí** | Estilo y fuentes de las descripciones |
| Sistema para agentes: `AGENTS.md` corto + shims + lectura por niveles + rituales inicio/cierre + handoff/TODO/CHANGELOG | **Sí, tal cual** | Reglas duras y trampas de TU proyecto |
| Fuentes (Met, Cleveland, Wikimedia, Wikidata, WikiArt), ranking por sitelinks, exclusión cristiana de la 06, Doré | **No: es de arte** | Reemplazar por las fuentes de tu dominio, pero **escribí sus trampas en tu `FUENTES.md` desde el día 1** |
| Cifras, nombres de colecciones, listas de targets | **No** | Se generan con `audit` y con tus propios targets |

## 2. Checklist para arrancar un proyecto nuevo del mismo tipo

1. **Definí qué es "excelente" en tu dominio** (tu regla de oro) y para qué se usa (¿personal o público? decide licencias).
2. **Elegí fuentes** y, por cada una, anotá en `FUENTES.md` User-Agent, límites, formato de imagen y trampas conocidas. Probá cada API con 3 casos antes de escribir código.
3. **Escribí el esquema del índice y sus invariantes ANTES de descargar** (`INVENTARIO.md`): qué campos, cuáles obligatorios, qué identifica una pieza.
4. **Copiá `tools/lib.mjs` y `tools/audit.mjs`** y adaptá constantes. Con eso ya tenés medición real, descarga validada, índice idempotente y verificación.
5. **Primer lote chico en dry-run.** Mirá las piezas a ojo; medí el archivo real, no lo que promete la API.
6. **`audit` en verde antes de cada commit.** Si el proyecto crece, que el cierre lo corra solo.
7. **Decidí la fuente de verdad de las fichas** (archivo de datos versionado, no el índice) y fijá el estilo con 3 ejemplos buenos y 1 malo.
8. **Escribí `AGENTS.md` (≤120 líneas)**: qué es, reglas duras, trampas, cómo verificar, palabras clave inicio/cierre, mapa de docs. Nada de estado ni diario ahí. Después los shims `CLAUDE.md` y `GEMINI.md` (`@AGENTS.md` en la primera línea).
9. **Creá `docs/SESSION_HANDOFF.md`, `TODO.md`, `CHANGELOG.md` y `docs/procesos/{INICIO,CIERRE}.md`** (copiables de este proyecto). Regla: un número vive en UN solo archivo.
10. **Prueba en frío:** un agente nuevo, sin nada de tu charla, con solo `AGENTS.md` y `docs/`, contesta 8 preguntas de control sobre el proyecto. Lo que falle te dice qué doc está flojo.

## 3. Qué copiar, paso a paso

```
AGENTS.md                      → reescribir contenido; conservar la estructura (qué es / reglas / trampas / verificar / rituales / mapa)
CLAUDE.md, GEMINI.md           → copiar tal cual (cortos: importan AGENTS.md)
docs/procesos/INICIO.md        → copiar; cambiar solo el comando de verificación (audit) y los docs de referencia
docs/procesos/CIERRE.md        → idem
docs/{SESSION_HANDOFF,TODO,CHANGELOG}.md → copiar los esqueletos, vaciar el contenido
.claude/                       → solo si usás Claude Code: settings.json + hooks/ + skills/{inicio,cierre} (los atajos apuntan a docs/procesos/)
tools/lib.mjs, tools/audit.mjs, tools/remove-work.mjs → copiar y adaptar constantes (pisos, grupos de colecciones)
```
Si usás el **Arquitecto** (Claude): su skill monta este esqueleto desde `~/.claude/skills/arquitecto/templates/` para un proyecto nuevo. Lo que agrega este proyecto es la capa agnóstica: el texto de los rituales vive en `docs/procesos/` (lo leen todos los agentes) y las skills de Claude solo apuntan ahí.

## 4. Lecciones de diseño que valen en cualquier proyecto

- **El verificador ejecutable vale más que la documentación del verificador.** Si un control lo tipeaste a mano 3 veces, es un script (`audit`).
- **Validá contenido, no solo status HTTP.** Una página de error con HTTP 200 se guardó como imagen 155 veces.
- **Un doc que miente es peor que no tener doc.** Por eso los números de estado salen de `audit` y viven en un solo archivo; y las reglas viejas superadas se marcan como superadas (tabla "regla inicial vs vigente" en `docs/FUENTES.md` §5).
- **Mover, no borrar.** Cualquier script que borre debe pedir dry-run primero; lo recuperable va a una carpeta de apartados.
- **Un escritor a la vez** sobre los archivos de datos compartidos.
- **Todo conocimiento crítico vive en el repo**, no en la memoria de un agente ni en el chat.

## 5. Mejoras posibles desde esta misma plataforma
Ver `docs/TODO.md` (sección "Ideas"): lock técnico de escritor único, que el cierre corra `audit` por hook, atajos nativos `/inicio` para Gemini/OpenCode (cuando los uses 3+ veces), y el visor/caption para la TV como proyecto aparte.
