# Ritual de INICIO — arrancar una sesión de trabajo

> Fuente única, agnóstica de agente (Claude, Gemini CLI, OpenCode…). Los atajos de cada agente (`/inicio` en Claude) solo apuntan acá.

**Cuándo:** el usuario dice "inicio", "retomemos", "arranquemos", "¿en qué quedamos?", o abre una sesión nueva.
**Regla madre:** una sesión = una misión. **No toques nada (archivos, índices, descargas) hasta el OK explícito del usuario.**

## Pasos

1. **Leé el contexto.** `AGENTS.md` (si tu agente no lo cargó solo) → `docs/SESSION_HANDOFF.md` → primeras ~40 líneas de `docs/TODO.md`.
   *Si tu agente ya inyectó el handoff (Claude con el hook SessionStart), no lo releas.*
2. **Cruzá con la realidad — corré `node tools/audit.mjs`** (~10 s, solo lectura, sin red). Comparalo con la sección "Estado verificado" del handoff:
   - Mismos totales y **0 FALLAS** → seguí.
   - Totales distintos o FALLAS → **decilo primero**. La realidad gana; el handoff está viejo o alguien tocó datos fuera de sesión.
3. **Cruzá con git** (el repo versiona docs, tools e índices; no las imágenes): `git status --short` y `git log --oneline -5`.
   ¿Hay cambios sin commitear que el handoff no menciona? Si sí, reportalo. (El handoff no guarda SHA: la fecha de cierre alcanza para saber cuánto pasó; `git log` da el resto.)
4. **Confirmale al usuario en 3 líneas:** **Estado** (de verdad, no del handoff) · **Próxima acción** (la del handoff) · **Bloqueos**.
   Si el usuario no dijo la misión, preguntala.
5. **Esperá el OK.** Recién ahí trabajás.

## Reglas

- Si el handoff tiene más de 7 días, avisá que puede estar viejo y verificá con `audit` + git antes de confiar en él.
- Si en medio de la sesión aparece una misión distinta de verdad, proponé `cierre` y una sesión nueva.
- **Un solo escritor a la vez** sobre los `_index.json`: si hay otro agente trabajando en el proyecto, no arranques escrituras (no hay lock técnico; se respeta por convención).
- Antes de cualquier tarea de datos, leé el doc de referencia que corresponda (`docs/CALIDAD.md`, `docs/INVENTARIO.md`, `docs/DESCRIPCIONES.md`, `docs/FUENTES.md`) — no los leas todos de entrada.
