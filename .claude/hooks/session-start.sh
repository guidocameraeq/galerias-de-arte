#!/bin/bash
# Hook SessionStart (solo Claude Code): inyecta el estado del proyecto en cada chat nuevo
# (y al retomar tras /clear o /compact). Su stdout entra como contexto.
# Es una COMODIDAD, no una dependencia: cualquier otro agente lee los mismos archivos a mano
# siguiendo docs/procesos/INICIO.md.
# $CLAUDE_PROJECT_DIR SIEMPRE entre comillas (paths con espacios rompen todo lo demás).
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

echo "=== SESSION_HANDOFF.md (inyectado por hook — NO hace falta releer el archivo) ==="
cat docs/SESSION_HANDOFF.md 2>/dev/null
echo ""
echo "=== TODO.md — primeras 40 líneas ==="
head -40 docs/TODO.md 2>/dev/null
echo ""
echo "=== git — últimos 5 commits + estado del working tree ==="
git log --oneline -5 2>/dev/null
git status --short 2>/dev/null | head -20
echo ""
echo "=== Recordatorio: decí 'inicio' para el ritual de arranque (docs/procesos/INICIO.md); no toco nada sin OK del usuario ==="
