# Ritual de CIERRE — cerrar la sesión (después el chat se descarta)

> Fuente única, agnóstica de agente. Los atajos de cada agente (`/cierre` en Claude) solo apuntan acá.

**Cuándo:** el usuario dice "cierre", "cerrá la sesión", "voy a comprimir/compactar", o terminó la misión.
**Dos modos:**
- **`cierre`** (completo): pasos 1-9. Después el chat se descarta y la próxima misión arranca con `inicio` en una sesión nueva.
- **`cierre parcial`** (emergencia: el contexto se llenó a mitad de misión): solo pasos **1-4**, y avisar "listo para compactar". Después de compactar, asumí que NO leíste ningún archivo: releé antes de editar.

## Pasos

1. **Verificá la realidad: `node tools/audit.mjs`.** Exige **0 FALLAS**. Si hay, arreglalas o dejalas anotadas como bloqueo #1 en el handoff (nunca las escondas). Guardá la línea `TOTAL:` — de ahí salen los números del paso 2.
2. **Reescribí `docs/SESSION_HANDOFF.md` ENTERO** (es la ÚNICA narrativa de la sesión; no se apila historia): fecha/hora (el SHA no se guarda: lo da `git log`) · qué se hizo (5-15 bullets) · **Estado verificado** (los números **copiados de la salida de `audit`**, jamás de memoria) · qué quedó en curso · **próximo paso CONCRETO** (nunca "seguir avanzando") · bloqueos · archivos tocados · contexto que no esté en otro doc.
3. **`docs/CHANGELOG.md`:** entrada nueva AL TOPE (Added / Changed / Fixed / Removed). Orden descendente.
4. **`docs/TODO.md`:** lo completado se BORRA (la historia queda en CHANGELOG y git); lo nuevo entra con criticidad. Es la única fuente de pendientes.

*— el modo `parcial` se detiene acá —*

5. **Docs de referencia, solo si esta sesión cambió algo que les toca:** un gate de calidad → `docs/CALIDAD.md` · el esquema de `_index.json` → `docs/INVENTARIO.md` · una trampa nueva de una API → `docs/FUENTES.md` · el flujo de fichas → `docs/DESCRIPCIONES.md` · una decisión de método → `docs/METODO.md` · un script nuevo/borrado → `tools/README.md` · una regla dura → `AGENTS.md`.
6. **Consistencia de números:** ningún conteo de estado (obras, colecciones, GB) duplicado fuera de `SESSION_HANDOFF.md`. Un número vive en UN archivo.
7. **Sin cabos sueltos:** limpiar temporales (`_inspect/`); lo que se saque de una colección se saca con `node tools/remove-work.mjs` (mueve a `_dedup_removed/` y loguea), nunca se borra a mano.
7b. **Publicar a Drive (SIEMPRE que la sesión tocó obras, fichas o metadatos):** la app solo ve lo que está en Drive, así que una sesión que cambia colecciones y no publica deja la TV desactualizada. `node tools/export-drive.mjs --all --big-max-side=3840` (dry; encuentra Drive solo, en cualquier letra) → revisar que no aparezcan `✗` ni borrados inesperados → `--apply`. Después `node tools/images-sync.mjs backup --apply` (respaldo de originales). Si Drive no aparece en ninguna unidad: **no se deja como pendiente callado**; pedirle a Guido que abra Drive para escritorio y reintentar. Lo reemplazado no se borra: queda en `Galerías de arte/_retiradas/`.
8. **Git:** `git add -A` → mostrarle `git status` al usuario y **esperar su OK** → commit `docs: cierre de sesión YYYY-MM-DD — <tema>`. Después del commit, `git push` al remoto privado de GitHub (`origin`); si el push falla, decirlo en el reporte.
9. **Reporte final** (5 líneas): SHA · qué cambió · próximo paso al retomar · bloqueos · **"Sesión lista para descartar — la próxima misión arranca con `inicio`."**

## Casos borde

- Cambios sin commitear que el usuario NO quiere commitear → preguntar: guardar aparte (stash) / descartar / commit selectivo / dejarlos y anotarlo en el handoff.
- `audit` da FALLAS que no son de esta sesión → documentarlas en el handoff como PRIMER paso de la próxima.
- Si una spec de `docs/SPEC-*.md` quedó implementada → marcar "✅ IMPLEMENTADO <fecha>" en su línea 1 y moverla a `docs/archive/`.
