# Galería 25 · Doré, el resto de su obra

> **Ubicación en repo:** `colecciones/25_dore_otras_obras/`
> **Ficha técnica:** 78 obras · 100% con ficha en español · lado largo 1816–6667 px

## Fundamento
Todo Gustave Doré que no es *La Divina Comedia* (esa es la galería 17): ilustraciones de libros (Biblia, *El viejo marinero*, *El paraíso perdido*, *Atala*, Perrault, La Fontaine, *Londres: una peregrinación*, *L'Espagne*, Balzac, Quijote, Orlando furioso…), más sus pinturas y dibujos. Selección canónica hecha con Guido el 2026-11-04 ("pocas y excelentes", una versión limpia por obra).

## Fuentes y procesamiento
- Wikimedia Commons (dominio público). Lista y fichas: `tools/targets/25_dore_otras.json`; importación: `tools/dore-otras-import.mjs`; fichas clavadas por id en `tools/desc/25_dore_otras_obras.mjs` (fuente: página de Commons de cada archivo y Wikipedia/Wikisource/museo, citadas en `description_source`).
- **37 obras vienen de páginas de libro con margen de papel o pie impreso y se recortó solo el papel/pie** con `tools/dore-crop.mjs` (excepción autorizada por Guido, ver `docs/CALIDAD.md` §5b; campo `processing` e `source_image_size`). Las otras 41 entran tal como las entrega Commons.
- Pinturas y dibujos llevan museo con ciudad y país cuando una fuente lo da.

## Criterios y descartes
Se descartaron fotos de cuadros colgados con marco, portadas, páginas de texto, collages, miniaturas, bocetos muy tenues, duplicados (misma plancha en otra edición) y dos obras sin atribución verificada. Todo está en `colecciones/25_dore_otras_obras/_candidatas.json`.
- Pendiente: *La Libertad* (Cleveland): en Commons solo hay un TIFF de 61 MB; conseguir JPEG.
- El tema cristiano no está excluido acá (la exclusión es solo de la colección 06): entran *El valle de las lágrimas* (Cristo con la cruz) y *Mártires cristianos*.

## Obras dudosas (marcadas `dudoso` en el índice)
*El cuervo* (dos láminas del libro del Met sin pie), *Atala* (la catarata y el lago de las ruinas no se ubicaron en el texto), *El gato con botas*, *El neozelandés*, *Orlando furioso*, *Elaine*, *La primera ascensión del Cervino*. Fichas sobrias, a revisar.
