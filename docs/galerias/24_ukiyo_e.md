# Galería 24 · Ukiyo-e

> **Ubicación en repo:** `24_ukiyo_e/` · Lista de objetivos: `tools/targets/24_ukiyo_e.json` · Fichas: `tools/desc/24_ukiyo_e.mjs`
> **Primera colección armada con el motor genérico** (`tools/harvest.mjs`) siguiendo `docs/procesos/NUEVA_COLECCION.md` (2026-11-03). Métricas vivas: `node tools/audit.mjs --col=24`.

---

## 1. Fundamento curatorial

Xilografías en color japonesas del período Edo, en su edad de oro (c. 1765–1860): las "imágenes del mundo flotante". Una galería **chica y excelente** (14 obras) con los seis maestros que la historia del arte pone en el centro: **Hokusai** y **Hiroshige** (paisaje), **Utamaro** (bijin-ga, retratos de mujeres), **Sharaku** (retratos de actores de kabuki), **Harunobu** (pionero de la impresión polícroma, nishiki-e) y **Kuniyoshi** (escenas fantásticas en tríptico). Varias de estas estampas fueron decisivas para el japonismo europeo: Van Gogh copió dos de los Hiroshige de esta galería.

## 2. Fuentes e ingesta

- Investigación del canon: subagente `investigador-curatorial` (fama por sitelinks de Wikidata, verificación de cada archivo en la API de Commons).
- Imágenes: Wikimedia Commons, **impresiones de época conservadas en museos**: The Metropolitan Museum of Art (CC0), Cleveland Museum of Art, Rijksmuseum, British Museum y Shimane Art Museum.
- Descarga: `node tools/harvest.mjs 24_ukiyo_e --apply` — 14/14, sin rechazos; archivo real medido; lado largo entre 1947 y 7139 px.

## 3. Criterios de selección y descartes

- **Se descartaron las reimpresiones modernas**, que dominan Commons y suelen pasar por "la" obra: ediciones Adachi y Takamizawa del siglo XX, visipix (c. 1930), una *Gran ola* "restaurada" a partir de una reimpresión Shōwa, copias recortadas.
- Se evitaron los archivos "Google Art Project" sin museo identificable y las P18 de Wikidata que apuntan a reimpresiones.
- Excluidas por baja resolución: impresiones de Brooklyn (768 px), Honolulu (744 px) y Library of Congress (~1024 px).
- Suplentes posibles: *Tres bellezas de la época* (Utamaro), *El puente Mannen* y *Ejiri* (Hokusai, Met).

## 4. Obras cumbre

- **Hokusai** — *La gran ola de Kanagawa*, *Viento del sur, cielo despejado (Fuji rojo)*, *Tormenta bajo la cumbre*, *Kajikazawa*.
- **Hiroshige** — *Aguacero súbito sobre el puente Shin-Ōhashi y Atake*, *Jardín de ciruelos en Kameido*, *Lluvia en Shōno*, *Nieve nocturna en Kanbara*.
- **Utamaro** — *Naniwaya Okita*, *Lavado del cabello*. **Sharaku** — *Ōtani Oniji III como Edobei*, *Ichikawa Ebizō*. **Harunobu** — *Amantes caminando en la nieve*. **Kuniyoshi** — *Takiyasha la bruja y el espectro del esqueleto*.

## 5. Estado técnico

- Revisión visual (hoja de contacto): las 14 imágenes corresponden a su título; sin mockups, marcos de sala ni reimpresiones.
- Fichas en español de fuente: subagente `redactor-fichas`, clavadas por id (`sourceId` de Commons).
- Riesgos conocidos: *Ichikawa Ebizō* es la más chica (1947 px); *Tormenta bajo la cumbre* viene de un escaneo sin página de museo propia (se ve bien; alternativa Met DP140976 si hiciera falta).
