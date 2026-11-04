# Galería 18 · Escultura Griega y Arqueología Clásica

> **Ubicación en repo:** `colecciones/18_escultura_griega/`  
> **Ficha técnica:** 64 obras · 100% con descripción en español · Resolución media: 3700 × 4728 px

---

## 1. Métricas de la Galería

| Parámetro | Valor |
|---|---|
| **Total de obras** | 64 piezas |
| **Distribución apaisada (landscape)** | 17 (27%) |
| **Distribución vertical (portrait)** | 47 (73%) |
| **Rango de resolución (lado largo)** | 1699 px – 11618 px |
| **Artistas representados** | 34 |
| **Índice canónico** | [`_index.json`](../../colecciones/18_escultura_griega/_index.json) |

---

## 2. Fundamento Curatorial y Período

**Período / Contexto:** Periodo Arcaico, Clásico y Helenístico (c. 600 a.C. – 100 d.C.)

64 piezas maestras dedicadas exclusivamente a la escultura y orfebrería de la Grecia antigua. Reúne las 9 piezas clásicas migradas de la Colección 01 junto con 55 obras cosechadas de los grandes museos arqueológicos de Grecia (Atenas NAMA, Acrópolis, Delfos, Olimpia, Heraklion) y salas clásicas del Louvre, Vaticano, MANN Nápoles, Termas de Roma y British Museum.

---

## 3. Fuentes e Ingesta

- **Plataformas consultadas:** Wikimedia Commons (resolución >3.700x4.700 px promedio).
- **Herramientas de adquisición:** `tools/migrate-greek-sculptures.mjs`, `tools/targets-18-sculptures.mjs`, `tools/harvest-18-sculptures.mjs`. Fichas en `tools/desc/18_escultura_griega.mjs`.

Todas las imágenes fueron auditadas y medidas directamente desde los bytes reales almacenados en disco (nunca desde las declaraciones de las APIs).

---

## 4. Criterios de Selección y Descartes

Exclusión deliberada de réplicas romanas mediocres y estatuas desfiguradas sin lectura anatómica clara, privilegiando bronces originales (Riace, Auriga de Delfos, Zeus/Poseidón de Artemisión) y mármoles canónicos (Partenón, Samotracia, Laocoonte).

El inventario respeta el principio central de curaduría: **pocas obras excelentes > muchas mediocres**.

---

## 5. Obras Cumbre de la Galería

- **Agesandro, Atenodoro y Polidoro — Grupo del Laocoonte (Museos Vaticanos)**
- **Alejandro de Antioquía — Venus de Milo (Museo del Louvre)**
- **Pitócrito — Victoria alada de Samotracia (Louvre)**
- **Mirón — El Discóbolo (Palazzo Massimo)**
- **Bronces de Riace (Museo Nazionale de Reggio Calabria)**
- **Auriga de Delfos y Dios del Cabo Artemisión (Atenas)**

---

## 6. Estado Técnico y Verificación

- **Fichas en español:** Redactadas y sintetizadas de fuentes documentales (Wikipedia en español y catálogos de museos) con foco en **qué muestra la obra y qué significa**.
- **Auditoría de integridad:** Verificada mediante `node tools/audit.mjs --col=18`.
- **Garantía:** 0 imágenes huérfanas, dimensiones reales idénticas al índice, carpetas correspondientes a la orientación real.
