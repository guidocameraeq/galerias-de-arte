# Galería 17 · Doré: La Divina Comedia

> **Ubicación en repo:** `colecciones/17_dore_divina_comedia/`
> **Ficha técnica:** 135 planchas (Infierno 75 · Purgatorio 42 · Paraíso 18) · 100% con ficha en español · lado largo 2670–5717 px · 37 apaisadas / 98 verticales

## Fundamento
La Divina Comedia completa ilustrada por Gustave Doré, **una versión limpia por plancha** (numeración del Dover: Infierno 1–75, Purgatorio 76–117, Paraíso 118–135). Título = `Libro · Canto N — escena`; el pie de grabado original (Dover 1976, trad. Longfellow) queda en `caption_en` / `caption_es`. Año: Infierno 1861; Purgatorio y Paraíso 1868 (edición Hachette).

## Fuentes y procesamiento (2026-11-04, reconstrucción completa)
- Wikimedia Commons. 21 planchas vienen ya limpias (recortes de voluntarios de Commons). **114 vienen de la edición Moeser (Berlín 1870/71), escaneada por la Biblioteca Nacional de Polonia, y se recortó solo el margen de papel** con `tools/dore-crop.mjs` (excepción autorizada por Guido a la regla 2: `docs/CALIDAD.md` §5b). Cada una lleva `processing` y `source_page`.
- Pies, cantos y erratas del Dover: `tools/targets/17_dante_planchas.json` (123 confirmadas, 12 con canto dudoso). Fichas: `tools/desc/17_dore_divina_comedia.mjs` (fuente: pie del Dover + resumen del canto en Wikipedia).
- Reconstrucción: `tools/dore-dante-import.mjs`. Las 98 entradas anteriores (fotos de libro con margen, duplicados, un cuadro reescalado con IA) se movieron a `_dedup_removed/` (recuperables).
- Falta la plancha 76 del Infierno (la edición Moeser numera hasta 75).

## Pendiente
- Revisar a 100% algunos bordes finos (p. ej. plancha 46) y las fichas marcadas `dudoso` (74, 125, 126, 132, 133).
- "El resto de Doré" (Biblia, Paraíso perdido, Marinero, Cuervo, Londres…) irá en otra colección: ver `docs/TODO.md`.
