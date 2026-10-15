---
name: inicio
description: Ritual de inicio de sesión de Arte. Usar cuando el usuario dice "inicio", "retomemos", "arranquemos", "¿en qué quedamos?" o al empezar una sesión de trabajo nueva.
---

# /inicio — arrancar una sesión de trabajo

Seguí **`docs/procesos/INICIO.md`** al pie de la letra. Es la fuente única del ritual (la usan todos los agentes); este archivo es solo el atajo de Claude Code. No dupliques pasos acá.

Notas específicas de Claude:
- El hook SessionStart ya inyectó `docs/SESSION_HANDOFF.md` + cabecera del TODO + estado git al abrir este chat. **No los releas** salvo señal de drift (fecha vieja, contradicción con git, o si el hook no aparece en el contexto).
- Después de un `/compact` asumí que NO leíste ningún archivo: Read antes de cualquier Edit.
