# Proceso de Adquisición Monográfica y Arte Contemporáneo

> **Guía canónica de ingeniería y curaduría.**  
> Este documento detalla la metodología y los filtros técnicos desarrollados y consolidados durante la incorporación de las colecciones monográficas recientes (19: Marcelo Canevari, 20: Alfred Kubin, 21: Rob Gonsalves, 22: Zdzisław Beksiński y 23: Mariusz Lewandowski).

---

## 1. Definición del Alcance y Canon

A diferencia de las colecciones temáticas o históricas amplias (Barroco, Impresionismo), las galerías monográficas buscan capturar la **esencia artística integral** de un creador en una selección compacta y de máxima excelencia:
- **Tamaño estándar:** 25 obras (hasta 40 en autores prolíficos con acervos públicos masivos como Alfred Kubin).
- **Criterio curatorial:** Pocas obras excelentes > muchas mediocres. Se priorizan piezas cumbre, series fundamentales, portadas de impacto cultural y obras de gran formato.
- **Piso de resolución no negociable:** Lado largo ≥ 1.000 px (óptimo 1.920 – 3.500 px).

---

## 2. Detección de Fuentes Primarias Confiables

Para evitar copias comprimidas de redes sociales o fotografías mal iluminadas, la búsqueda rastrea fuentes primarias autorizadas:
1. **Estates oficiales y sitios de herederos:** (p.ej. `lewandowski.art`, sitio oficial de Rob Gonsalves). Suelen albergar imágenes en alta resolución del archivo fotográfico personal o escaneos directos de taller.
2. **Galerías de representación:** (p.ej. Mindy Solomon Gallery, Galería COTT, Marcus Ashley Gallery en Lake Tahoe). Imágenes profesionales de catálogo para coleccionistas.
3. **Colecciones y museos monográficos:** (p.ej. Leopold Museum de Viena para Alfred Kubin a 3.500 px, Lenbachhaus de Múnich, Sanok Historical Museum).
4. **Repositorios de archivo:** WikiArt (usando emulación de User-Agent de navegador) y Wikimedia Commons a resolución nativa.

---

## 3. Barreras Técnicas y Filtros Anti-Basura

### A. Validación Estricta por Magic Bytes (`looksLikeImage`)
Una trampa crítica en scraping de arte es que muchos servidores responden a límites de tasa (HTTP 429) o bloqueos de Cloudflare con **páginas HTML de error devueltas bajo código HTTP 200**. Si solo se verifica `response.ok`, el archivo HTML se guarda como `.jpg` corrompiendo la biblioteca (como ocurrió históricamente en la colección 17 con 155 archivos).

**Protocolo:**
- Toda descarga valida los magic bytes iniciales en memoria antes de escribir en disco:
  - JPEG: `FF D8`
  - PNG: `89 50 4E 47`
  - WebP: `RIFF .... WEBP`
- Si no comienza con estos bytes, la descarga se aborta inmediatamente y se reintenta con backoff.

### B. Detección Algorítmica de Mockups de Tienda (Filtro `sharp`)
Los sitios comerciales modernos suelen incluir en sus catálogos no solo el lienzo plano, sino "mockups" decorativos (el cuadro colgado en una pared de living gris o blanca sobre un sillón).
- **Solución implementada en Lewandowski (`tools/harvest-23-lewandowski.mjs`):**
  - Muestreo perimetral de píxeles en bordes y cuatro esquinas con `sharp`.
  - Si los píxeles perimetrales presentan tonalidades uniformes de pared de estudio (blancos, grises desaturados claros `r,g,b > 230` con baja desviación típica), la imagen se cataloga como mockup comercial y se descarta automáticamente en favor del archivo plano del lienzo.

### C. Descarte de Franjas y Marcos Superpuestos
Se rechazan escaneos con bordes de catálogo, cartelas de museo o franjas blancas/negras añadidas artificialmente.

---

## 4. Ingesta, Clasificación y Mediciones Reales

1. **El archivo en disco es la única verdad:**
   Las dimensiones jamás se toman de los metadatos de la API o atributos HTML; se decodifican directamente del buffer descargado mediante `imgSize(buf)` (`lib.mjs`).
2. **Orientación estricta:**
   `w >= h` $\to$ guardado en `landscape/`.  
   `w < h` $\to$ guardado en `portrait/`.  
   *(Cuadradas y panorámicas van a `landscape/`).*
3. **Nomenclatura canónica:**
   `NN_Titulo_Autor_Año.jpg` generado por `buildFilename(n, title, artist, year)` sin acentos, eñes ni caracteres prohibidos.

---

## 5. Fichas de Curaduría en Español

Cada obra debe poseer una ficha descriptiva rigurosa:
- **Redacción documentada:** Síntesis a partir de textos curatoriales oficiales, catálogos razonados, monografías o Wikipedia. **Nunca de memoria ni con alucinaciones generativas.**
- **Estructura fija:**
  1. *Qué muestra:* Descripción plástica directa de los elementos visibles, figuras, paleta y composición.
  2. *Qué significa:* Significado simbólico, trasfondo mitológico, literario o existencial, y contexto dentro de la trayectoria del artista.
- **Persistencia desacoplada:**
  Toda ficha se vuelca en `tools/desc/NN_nombre.mjs` y se inyecta en `_index.json`. Esto asegura que ante cualquier actualización o re-indexación, la metadata esté a salvo de sobrescrituras accidentales.

---

## 6. Verificación de Integridad (Garantía Cero Fallas)

Antes de dar por concluida la recolección, se ejecuta:
```bash
node tools/audit.mjs --col=NN
```
La auditoría valida en frío:
- Que cada archivo exista en disco y no haya archivos huérfanos.
- Que el contenido sea un binario gráfico genuino.
- Que las dimensiones reales del disco coincidan píxel a píxel con el índice.
- Que la orientación corresponda con la carpeta física.
- Que el 100% de las obras cuente con ficha redactada.
- Que no existan colisiones de nombres ni desfases de claves.
