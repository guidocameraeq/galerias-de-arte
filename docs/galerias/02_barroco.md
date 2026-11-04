# Galería 02 · Barroco

> **Ubicación en repo:** `colecciones/02_barroco/`  
> **Ficha técnica:** 127 obras · 100% con descripción en español · Resolución media: 3760 × 3899 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 127 piezas |
| **Distribución apaisada (landscape)** | 48 (38%) |
| **Distribución vertical (portrait)** | 79 (62%) |
| **Rango de resolución (lado largo)** | 1200 px – 13086 px |
| **Artistas representados** | 37 |
| **Índice canónico** | [`_index.json`](../../colecciones/02_barroco/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Siglo XVII (c. 1600 – 1750)

Celebración del claroscuro, el dramatismo teatral, la tensión psicológica y el realismo sensual del siglo XVII europeo. Comprende las escuelas italiana, flamenca, holandesa y española. Obras de enorme dinamismo visual, iluminación tenebrista y detallismo textural.

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Metropolitan Museum of Art, Cleveland Museum of Art, Rijksmuseum, Prado y Wikimedia Commons vía canon de fama de Wikidata.
- **Herramientas de adquisición:** `tools/collect.mjs` (Fase 1 targets + discovery Met), expandido luego por `tools/canon.mjs` (`tools/canon/02_barroco.mjs`). Fichas en `tools/desc/02_barroco.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

323 registros en `_descartes/02_barroco.jsonl`. Se filtraron obras por debajo de 1.000 px, estudios de taller anónimos, retratos cortesanos estáticos de baja relevancia y duplicados con la colección 06 (Memento Mori).

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Caravaggio — La vocación de San Mateo, David con la cabeza de Goliat, El entierro de Cristo**
- **Rembrandt van Rijn — La ronda de noche, La lección de anatomía del Dr. Nicolaes Tulp**
- **Johannes Vermeer — Muchacha con turbante, El astrónomo, El geógrafo**
- **Diego Velázquez — Las Meninas, Las hilanderas, El triunfo de Baco**
- **Peter Paul Rubens — Las tres Gracias, El rapto de las hijas de Leucipo**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=02`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
