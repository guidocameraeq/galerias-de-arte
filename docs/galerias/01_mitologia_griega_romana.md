# Galería 01 · Mitología Griega y Romana

> **Ubicación en repo:** `01_mitologia_griega_romana/`  
> **Ficha técnica:** 142 obras · 100% con descripción en español · Resolución media: 3458 × 3280 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 142 piezas |
| **Distribución apaisada (landscape)** | 85 (60%) |
| **Distribución vertical (portrait)** | 57 (40%) |
| **Rango de resolución (lado largo)** | 1024 px – 7870 px |
| **Artistas representados** | 83 |
| **Índice canónico** | [`_index.json`](../../01_mitologia_griega_romana/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Renacimiento al Siglo XIX (Pintura Clásica Europea)

La pinacoteca mitológica de referencia del proyecto. Agrupa las grandes representaciones pictóricas de los dioses olímpicos, titanes, monstruos y héroes grecolatinos. Originalmente incluía 9 esculturas canónicas (Laocoonte, Venus de Milo, etc.) que fueron migradas a la Colección 18 para transformar a la 01 en una galería 100% pictórica (con la excepción fundacional de la Loba Capitolina). Incorpora dos grandes expansiones: pinturas mitológicas maestras (Botticelli, Tiziano, Tintoretto, Rubens, Moreau, Waterhouse) y mitos épicos (la Titanomaquia, los Trabajos de Hércules de Zurbarán del Prado, la Guerra de Troya y el Tártaro).

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Wikimedia Commons (resolución WMC a 8.000 px), Metropolitan Museum of Art, Cleveland Museum of Art, Museo del Prado, National Gallery de Londres y Louvre.
- **Herramientas de adquisición:** `tools/collect.mjs`, `tools/targets-01.mjs`, `tools/targets-01-paintings.mjs`, `tools/harvest-01-paintings.mjs`, `tools/targets-01-epic-myths.mjs`, `tools/harvest-01-epic-myths.mjs`, `tools/migrate-greek-sculptures.mjs`. Fichas en `tools/desc/01_mitologia_griega_romana.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

120 registros en `_descartes/01_mitologia_griega_romana.jsonl`. Se descartaron búsquedas automáticas con lado largo menor a 1000 px, duplicados de representaciones bíblicas confundidas por metadatos, copias de taller y réplicas menores. Las 9 esculturas fueron transferidas con preservación de metadatos.

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Sandro Botticelli — El nacimiento de Venus y La Primavera (Uffizi)**
- **Tiziano — Baco y Ariadna y Dánae recibiendo la lluvia de oro**
- **Francisco de Zurbarán — Serie completa de Los Trabajos de Hércules (Museo del Prado)**
- **Peter Paul Rubens — La caída de Faetón y Saturno devorando a su hijo**
- **Gustave Moreau — Júpiter y Sémele y Edipo y la Esfinge**
- **John William Waterhouse — Hylas y las ninfas y Ulises y las sirenas**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=01`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
