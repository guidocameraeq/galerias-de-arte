# FICHAS_APP — qué información lleva cada obra en la app y a cuáles se les pone

> Complementa `docs/DESCRIPCIONES.md` (cómo se escriben las fichas) y `docs/FORMATO_DRIVE.md` (dónde van en el `galeria.json`). Estado numérico: **`node tools/fichas-stats.mjs`** (los números no viven acá). **Todo lo marcado PROPUESTA espera el OK de Guido.**

## Qué ve el público en la TV (el "cartel de museo")
Imagen con marco + cartel con: **título · autor (y vida) · año · movimiento · técnica · medidas · ubicación** + **explicación** al costado (+ crédito chico). Todo opcional salvo el archivo: lo que no tenemos, no se muestra.

## Qué datos tenemos y cuáles no (de `node tools/fichas-stats.mjs`, 2026-11-02)
- **Hay para casi todas:** título, autor, año, escuela (`movimiento`), explicación en español.
- **Hay para la mayoría, con huecos:** museo (`ubicacion`), técnica (`tecnica`), título en español (`title_es`).
- **No existen:** `vida_autor`, `medidas`, `forma`. Se completan solo si se pide y para las galerías que valgan la pena (Wikidata P569/P570 y P2048 dan vida y medidas; no está hecho).
- **La explicación es el punto débil:** casi ninguna llega a las 80 palabras que pide la app; la mediana ronda 30–60 palabras. Una parte (los `description_source` = `Wikipedia-es: …`) es un extracto de Wikipedia que repite título/año/museo: es un **piso, no el estándar**. Los textos hechos a mano (`Síntesis (Claude, …)`) son mejores pero cortos.

## PROPUESTA: a qué obras se les escribe explicación completa y a cuáles no
Criterio: **no escribir 1382 textos de golpe**; priorizar lo que la TV va a mostrar.
| Nivel | Qué | Qué lleva |
|---|---|---|
| **1 · Ficha completa** | Las galerías que Guido elija publicar primero + las obras icónicas de cada colección (`canon_rank` alto) | `explicacion` 80–150 palabras (2 párrafos: qué muestra · qué significa/contexto), `tecnica`, `ubicacion`, `vida_autor`, `medidas` si hay fuente, `forma` si es tondo |
| **2 · Ficha mínima** | El resto de las obras | Lo que ya hay: título, autor, año, movimiento, `explicacion` actual aunque sea corta |
| **3 · Sin ficha** | Obras que Guido pode o que no valgan | Se exportan sin `explicacion` (la app lo tolera) o se sacan de la galería |
Orden de trabajo sugerido: (1) reescribir las `Wikipedia-es` de las galerías elegidas; (2) las que tienen <60 palabras; (3) completar `ubicacion`/`tecnica` vacíos; (4) `title_es` faltante; (5) `vida_autor`/`medidas` si hay ganas.

## Reglas de redacción para la app
1. **Español, de una fuente** (Wikipedia/curatorial/museo), nunca de memoria (regla dura 8). Guardar `description_source`.
2. 80–150 palabras, texto plano, sin Markdown, párrafos con `\n\n`. Primero qué se ve, después qué significa y por qué importa.
3. Sin juicios inventados ni datos que no estén en la fuente. Si no hay fuente buena, ficha corta y verdadera antes que larga e imprecisa.
4. Tondos y medallones: marcar `forma` (lista manual en el exportador).
5. Fuente de verdad de las fichas: `tools/desc/NN.mjs` (ver `DESCRIPCIONES.md`); una ficha más larga reemplaza a la corta en ese mismo archivo, por `n`.

## Pendiente de decidir con Guido
- ¿Qué galerías primero? ¿Todo el catálogo o solo las icónicas?
- ¿Se investigan `vida_autor` y `medidas` o se omiten?
- ¿Las fichas largas se guardan en `tools/desc/` (mismo flujo) o en un campo nuevo (`explicacion_app`) para no pisar las cortas? Recomendación: mismo flujo, `desc/` ya es la fuente de verdad.
