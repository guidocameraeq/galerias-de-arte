@AGENTS.md

# Notas solo para Claude Code
- Atajos: `/inicio` y `/cierre` (skills en `.claude/skills/`) → ejecutan `docs/procesos/INICIO.md` y `CIERRE.md`. Las reglas viven en `AGENTS.md`; acá no se duplica nada.
- El hook SessionStart ya inyecta `docs/SESSION_HANDOFF.md` + `docs/TODO.md` + git: no los releas. Tras un `/compact`, asumí que NO leíste ningún archivo: Read antes de cualquier Edit.
- Editar `.mjs` o `.json` dispara un chequeo de sintaxis (hook `check-code`): si falla, corregí antes de seguir.
- Los docs viejos (CLAUDE.md/PLAN.md/START_HERE.md de junio) están en `docs/archive/legacy-2026-06/`: pueden contradecir al código; no los uses como fuente.
