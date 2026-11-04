# Galería 06 · Macabro & Memento Mori

> **Ubicación en repo:** `colecciones/06_macabro_memento_mori/`  
> **Ficha técnica:** 41 obras · 100% con descripción en español · Resolución media: 3039 × 2714 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 41 piezas |
| **Distribución apaisada (landscape)** | 25 (61%) |
| **Distribución vertical (portrait)** | 16 (39%) |
| **Rango de resolución (lado largo)** | 1061 px – 6762 px |
| **Artistas representados** | 24 |
| **Índice canónico** | [`_index.json`](../../colecciones/06_macabro_memento_mori/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Siglos XVI al XIX (Renacimiento tardío, Barroco y Romanticismo)

Exploración secular y alegórica de la finitud de la vida, las vanitas, el triunfo de la muerte, la descomposición corporal y la brujería. **Regla dura del proyecto:** Exclusión estricta de imágenes de devoción cristiana (crucifixiones, martirios de Cristo), concentrándose en el contenido filosófico, alegórico y pagano/secular de la muerte.

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Metropolitan Museum, Cleveland Museum, Wellcome Collection y Wikimedia Commons.
- **Herramientas de adquisición:** `tools/collect.mjs` (`tools/targets-06.mjs`) con filtro negativo anti-Cristo en el resolver. Fichas en `tools/desc/06_macabro_memento_mori.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

64 registros en `_descartes/06_macabro_memento_mori.jsonl`. Se descartaron activamente crucifixiones, escenas de la Pasión y grabados religiosos devocionales, así como grabados con manchas excesivas o baja resolución.

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Pieter Bruegel el Viejo — El triunfo de la muerte (Museo del Prado)**
- **Hans Baldung Grien — La muerte y la doncella**
- **Albrecht Dürer — El caballero, la muerte y el diablo**
- **Vanitas barrocas con calaveras, relojes de arena y velas extintas (Claesz, Steenwijck)**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=06`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
