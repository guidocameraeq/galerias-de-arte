# Galería 17 · Doré: La Divina Comedia

> **Ubicación en repo:** `17_dore_divina_comedia/`  
> **Ficha técnica:** 98 obras · 100% con descripción en español · Resolución media: 3882 × 4381 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 98 piezas |
| **Distribución apaisada (landscape)** | 29 (30%) |
| **Distribución vertical (portrait)** | 69 (70%) |
| **Rango de resolución (lado largo)** | 2404 px – 7517 px |
| **Artistas representados** | 1 |
| **Índice canónico** | [`_index.json`](../../17_dore_divina_comedia/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** 1861 – 1868 (Grabados en madera)

Colección excepcional monográfica de 98 grabados monumentales de Gustave Doré ilustrando el *Infierno*, *Purgatorio* y *Paraíso* de Dante Alighieri. Títulos estandarizados como `Infierno · Canto N` para una experiencia inmersiva serial en TV.

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Wikimedia Commons (categorías de Dante / Doré a máxima fidelidad en madera).
- **Herramientas de adquisición:** `tools/dore-redownload.mjs`, `tools/dore-dedup.mjs` (algoritmo dHash 16x16 de 256 bits), `tools/dore-desc.mjs`. Usa `sharp` para deduplicación perceptual y hojas de contacto.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

57 registros en `_descartes/17_dore_divina_comedia.jsonl`. Enorme proceso de depuración: 155 archivos que originalmente eran páginas de error HTML guardadas como .jpg fueron re-descargados con validación estricta de magic bytes; y planchas duplicadas entre cantos fueron detectadas mediante dHash (umbral ≤11) y movidas a `_dedup_removed/`.

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Infierno · Canto I (Dante perdido en la selva oscura y la aparición de Virgilio)**
- **Infierno · Canto III (La barca de Caronte cruzando el Aqueronte)**
- **Infierno · Canto XXXIV (Lucifer aprisionado en el hielo del Cocito)**
- **Purgatorio · Canto IX (El ángel guardián con la espada flamígera)**
- **Paraíso · Canto XXXI (La Rosa Celeste de los bienaventurados)**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=17`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
