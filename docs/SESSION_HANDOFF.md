# SESSION_HANDOFF — Arte

> Save game del proyecto. `cierre` lo SOBREESCRIBE ENTERO en cada sesión — acá nunca se apila historia (eso vive en CHANGELOG). Los números de estado se copian de `node tools/audit.mjs`, nunca de memoria. No guarda SHA: `git log` lo da.

**Cierre**: 2026-10-15

## Qué se hizo
- Se dejó el proyecto levantable por cualquier agente: `AGENTS.md` canónico (corto, solo reglas y trampas) + adaptadores `CLAUDE.md` y `GEMINI.md` que lo importan. OpenCode lee `AGENTS.md` directo.
- Se escribió el sistema de documentación en `docs/`: conocimiento (`METODO`, `CALIDAD`, `INVENTARIO`, `DESCRIPCIONES`, `FUENTES`, `REUTILIZAR`), rituales agnósticos (`procesos/INICIO`, `CIERRE`) y la capa operativa (este handoff, `TODO`, `CHANGELOG`). Cada doc se verificó contra el código real.
- Se creó `tools/audit.mjs` (verificación ejecutable de solo lectura = garantía de calidad y fuente de los números de estado) y `tools/remove-work.mjs` (sacar UNA obra sin perderla: mueve, loguea, limpia la ficha).
- Se cerraron huecos reales: `downloadTo` valida contenido (causa de los 155 archivos rotos de Doré), `loadIndex` ya no traga un JSON roto, `imgSize` mide WebP, los retiros (`prune-*`, `dore-dedup`) MUEVEN en vez de borrar, y `gap-desc`/`dore-dedup-apply` abortan (un solo uso). Se corrigieron 3 archivos `tools/desc/` desfasados.
- Dos verificaciones independientes: un crítico adversarial (encontró 18 problemas reales, todos atendidos; 1 era falso) y una prueba en frío (un agente sin contexto respondió 9/10 bien y 1 parcial; el hueco que mostró es el que cubre `remove-work.mjs`).
- Git local (sin remoto) versiona docs/tools/`.claude`/índices; las imágenes quedan afuera.

## Estado verificado (salida de `node tools/audit.mjs`)
- `TOTAL: 17 colecciones · 1102 obras · 1102 con ficha · 6.18 GB · 0 FALLAS · 43 AVISOS`
- Los avisos son revisiones pendientes, no errores (obras bajo el piso de resolución, `.jpg` que son PNG/WebP, `qid` repetidos, `n` con huecos). Detalle: `node tools/audit.mjs --all`.

## En curso
- Nada a medias.

## Próximo paso CONCRETO
Pedirle al usuario las decisiones del `docs/TODO.md` 🟠: (1) qué hacer con los `.jpg` que son PNG/WebP, (2) si se borra `_dedup_removed/` de la 17, (3) si se retiran `prune-canon`/`prune-modern`. Y que pruebe `AGENTS.md` en Gemini CLI y OpenCode (2 comandos, en el TODO).

## Bloqueos
- Ninguno técnico. Pendiente del usuario: la prueba real en Gemini CLI / OpenCode (no hay otro agente instalado en esta PC).

## Archivos tocados
`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `START_HERE.md`, `.gitignore`, `.claude/**`, `docs/**`, `tools/{audit,remove-work,lib,prune-canon,prune-modern,gap-desc,dore-dedup,dore-dedup-apply,README}`, `tools/desc/{01,02,11}`. `PLAN.md` retirado (copia en `docs/archive/legacy-2026-06/`).

## Contexto que no está en otro doc
- Las convenciones de carga de contexto de Gemini CLI y OpenCode salieron de guías de terceros y no se pudieron probar acá: por eso `GEMINI.md` y `CLAUDE.md` importan `AGENTS.md` explícitamente.
- La memoria persistente de Claude para este proyecto está vacía: nada crítico vive fuera del repo.
- La sesión en la que se hizo esto arrancó con el `CLAUDE.md` viejo ya inyectado en el contexto; una sesión nueva carga el adaptador nuevo.
