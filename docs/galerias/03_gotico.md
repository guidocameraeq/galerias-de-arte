# Galería 03 · Gótico y Baja Edad Media

> **Ubicación en repo:** `colecciones/03_gotico/`  
> **Ficha técnica:** 102 obras · 100% con descripción en español · Resolución media: 3265 × 3277 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 102 piezas |
| **Distribución apaisada (landscape)** | 47 (46%) |
| **Distribución vertical (portrait)** | 55 (54%) |
| **Rango de resolución (lado largo)** | 819 px – 10121 px |
| **Artistas representados** | 45 |
| **Índice canónico** | [`_index.json`](../../colecciones/03_gotico/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Siglos XII al XV (Arte medieval tardío y Primitivos Flamencos)

Espiritualidad medieval, oro bruñido, retablos góticos y el surgimiento del óleo con los primitivos flamencos e italianos. Abarca el gótico internacional, la pintura sienesa y florentina temprana (Giotto, Duccio, Fra Angelico) y la revolución flamenca (Van Eyck, Van der Weyden, Memling, El Bosco).

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Metropolitan Museum of Art, Cleveland Museum of Art, National Gallery de Londres y Wikimedia Commons / Wikidata.
- **Herramientas de adquisición:** `tools/collect.mjs` (Fase 1 targets), ampliado con `tools/canon.mjs` (`tools/canon/03_gotico.mjs`). Fichas en `tools/desc/03_gotico.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

140 registros en `_descartes/03_gotico.jsonl`. Descarte sistemático de manuscritos iluminados incompletos, piezas de resolución baja (<1000 px) y fragmentos ilegibles de retablos desmembrados.

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Jan van Eyck — El matrimonio Arnolfini, La Virgen del canciller Rolin**
- **Hieronymus Bosch (El Bosco) — El jardín de las delicias, El carro de heno, Tríptico de las tentaciones**
- **Rogier van der Weyden — El descendimiento de la cruz**
- **Giotto di Bondone — Frescos de la Capilla de los Scrovegni**
- **Fra Angelico — La Anunciación**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=03`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
