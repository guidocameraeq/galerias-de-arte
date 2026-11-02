# Galería 05 · Arte del Antiguo Egipto

> **Ubicación en repo:** `05_egipcio/`  
> **Ficha técnica:** 36 obras · 100% con descripción en español · Resolución media: 3118 × 2876 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 36 piezas |
| **Distribución apaisada (landscape)** | 19 (53%) |
| **Distribución vertical (portrait)** | 17 (47%) |
| **Rango de resolución (lado largo)** | 1976 px – 5472 px |
| **Artistas representados** | 3 |
| **Índice canónico** | [`_index.json`](../../05_egipcio/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Imperio Antiguo a Periodo Greco-Romano (c. 2600 a.C. – 300 d.C.)

Arte ceremonial, funerario y dinástico del Valle del Nilo. Centrado en la estatuaria divina y faraónica, relieves policromados, frescos de tumbas tebanas, joyería y sarcófagos.

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Colección de Arte Egipcio del Metropolitan Museum of Art (Departamento 10) y Wikimedia Commons.
- **Herramientas de adquisición:** `tools/collect.mjs` (`tools/targets-05.mjs`) + enriquecimiento manual. Fichas en `tools/desc/05_egipcio.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

32 registros en `_descartes/05_egipcio.jsonl`. Amuletos minúsculos, tiestos cerámicos fragmentarios y fotografías de mala iluminación.

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Busto y estatuaria de Hatshepsut (Metropolitan Museum)**
- **Relieves de templos y tumbas dinásticas**
- **Pectorales y joyas de oro y fayenza egipcia**
- **Papiros del Libro de los Muertos y máscaras funerarias**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=05`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
