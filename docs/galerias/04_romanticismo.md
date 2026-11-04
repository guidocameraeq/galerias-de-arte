# Galería 04 · Romanticismo

> **Ubicación en repo:** `colecciones/04_romanticismo/`  
> **Ficha técnica:** 116 obras · 100% con descripción en español · Resolución media: 3608 × 2903 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 116 piezas (el resto de las métricas son de antes de 2026-11-04: +14 obras de la carpeta personal de Guido, ver `tools/targets/04_romanticismo.json`; Turner reemplazado por versión de 2152 px) |
| **Distribución apaisada (landscape)** | 81 (79%) |
| **Distribución vertical (portrait)** | 21 (21%) |
| **Rango de resolución (lado largo)** | 800 px – 7764 px |
| **Artistas representados** | 19 |
| **Índice canónico** | [`_index.json`](../../colecciones/04_romanticismo/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Finales del Siglo XVIII a Mediados del Siglo XIX (c. 1780 – 1850)

El culto a lo sublime, la fuerza indómita de la naturaleza, las ruinas góticas, el misterio y el tormento del alma. Destacan las visiones cósmicas y tempestuosas de Turner, la soledad contemplativa de Friedrich, las pasiones revolucionarias de Delacroix y las pinturas negras de Goya.

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Metropolitan Museum, Cleveland Museum, Tate Britain, Prado, Louvre y Wikimedia Commons.
- **Herramientas de adquisición:** `tools/collect.mjs`, ampliado con `tools/canon.mjs` (`tools/canon/04_romanticismo.mjs`). Fichas en `tools/desc/04_romanticismo.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

211 registros en `_descartes/04_romanticismo.jsonl`. Exclusión de vistas topográficas menores, grabados de baja resolución y miniaturas.

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Caspar David Friedrich — El caminante sobre el mar de nubes, El mar de hielo**
- **J. M. W. Turner — Lluvia, vapor y velocidad, El Temerario remolcado a su último atraque, Barco de esclavos**
- **Eugène Delacroix — La Libertad guiando al pueblo, La barca de Dante**
- **Francisco de Goya — Pinturas negras (Saturno devorando a su hijo, El aquelarre)**
- **Théodore Géricault — La balsa de la Medusa**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=04`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
