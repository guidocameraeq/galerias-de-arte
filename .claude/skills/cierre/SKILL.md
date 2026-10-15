---
name: cierre
description: Ritual de cierre de sesión de Arte. Usar cuando el usuario dice "cierre", "cerrá la sesión", "voy a comprimir", "compact ya", "prepará todo para compactar" o "cierre parcial".
---

# /cierre — cerrar la sesión (después el chat se descarta)

Seguí **`docs/procesos/CIERRE.md`** al pie de la letra. Es la fuente única del ritual (la usan todos los agentes); este archivo es solo el atajo de Claude Code. No dupliques pasos acá.

- **`cierre`** → modo completo (pasos 1-9).
- **`cierre parcial`** → la emergencia pre-compactación: solo los pasos 1-4 y avisar "listo para `/compact`". Tras el `/compact`, el hook SessionStart re-inyecta el handoff.

Notas específicas de Claude:
- Si `docs/SPEC-*.md` quedó implementado en la sesión: marcar "✅ IMPLEMENTADO <fecha>" en su línea 1 y moverlo a `docs/archive/`.
- Si cambió un hecho estructural de cómo trabaja el usuario, actualizar también la memoria persistente de Claude (pero **nada crítico del proyecto vive solo ahí**: el repo es la fuente de verdad).
