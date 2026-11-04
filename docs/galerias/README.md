# Galerías — Índice y Guía Curatorial

Este directorio documenta de forma exhaustiva cada una de las **23 colecciones** que componen la biblioteca curada de arte en alta resolución.

Cada documento detalla el alcance temático, los criterios de curaduría y canon, las fuentes utilizadas, los descartes y filtros aplicados, así como las herramientas y estado técnico de cada galería.

---

## 1. Métricas Globales Consolidadas

*Verificado con `node tools/audit.mjs` (garantía de solo lectura, sin red).*

- **Colecciones activas:** 23
- **Total de obras:** 1.382
- **Obras con ficha en español:** 1.382 (100% de cobertura)
- **Volumen total en disco:** 7,37 GB
- **Estado de integridad:** 0 FALLAS · 62 AVISOS (avisos informativos de extensiones originales y saltos de numeración tras podas)

---

## 2. Mapa de Galerías por Agrupación Temática

### A. Canon Clásico y Mitología
- [01. Mitología Griega y Romana](01_mitologia_griega_romana.md) — 142 obras (828 MB). Pinacoteca de referencia en dioses, titanes y héroes grecolatinos.
- [05. Antiguo Egipto](05_egipcio.md) — 36 obras (91 MB). Arte funerario, estatuaria, sarcófagos y jeroglíficos (Metropolitan Museum).
- [18. Escultura Griega y Clásica](18_escultura_griega.md) — 64 obras (518 MB). Bronces arcaicos y clásicos, mármoles del Partenón y obras maestras arqueológicas.

### B. Historia del Arte Europeo (Edad Media → Siglo XIX)
- [03. Gótico y Medieval](03_gotico.md) — 102 obras (496 MB). Polípticos flamencos, retablos dorados, el Bosco y van Eyck.
- [07. Alto Renacimiento](07_alto_renacimiento.md) — 94 obras (582 MB). Leonardo, Miguel Ángel, Rafael, Tiziano y la apoteosis florentina/veneciana.
- [02. Barroco](02_barroco.md) — 127 obras (711 MB). Claroscuro dramático, tenebrismo y maestría: Caravaggio, Rembrandt, Velázquez, Rubens.
- [11. Rococó](11_rococo.md) — 38 obras (178 MB). Galantería, sensualidad pastoril y refinamiento cortesano: Fragonard, Boucher, Watteau.
- [16. Neoclasicismo](16_neoclasicismo.md) — 41 obras (196 MB). Virtud cívica, orden grecorromano y solemnidad: David, Ingres, Canova.
- [04. Romanticismo](04_romanticismo.md) — 102 obras (577 MB). El sentimiento de lo sublime, naufragios, nieblas y pasiones desbordadas: Turner, Friedrich, Goya, Delacroix.
- [10. Realismo](10_realismo.md) — 84 obras (443 MB). Retrato descarnado del trabajo, la tierra y la vida social: Courbet, Millet, Daumier, Repin.

### C. Modernidad Temprana y Rupturas
- [08. Impresionismo](08_impresionismo.md) — 67 obras (335 MB). Luz atmosférica, pincelada suelta y modernidad al aire libre: Monet, Renoir, Degas, Pissarro.
- [09. Postimpresionismo](09_postimpresionismo.md) — 55 obras (365 MB). Expresión del color, estructura y simbolismo formal: Van Gogh, Cézanne, Gauguin, Seurat.
- [12. Simbolismo y Art Nouveau](12_simbolismo_modernismo.md) — 70 obras (382 MB). El misterio, la alegoría interior, Klimt, Redon, Mucha, Khnopff.
- [13. Vanguardias del Siglo XX](13_vanguardias.md) — 44 obras (138 MB). Cubismo, futurismo, constructivismo, De Stijl y abstracción temprana: Picasso, Kandinsky, Malevich, Mondrian.
- [14. Surrealismo Histórico](14_surrealismo.md) — 21 obras (11 MB). El inconsciente, paisajes oníricos y autómatas psíquicos: Dalí, Magritte, Ernst, De Chirico.
- [15. Pop Art Americano](15_pop_americano.md) — 16 obras (25 MB). Consumismo, mass-media y gráfica publicitaria: Warhol, Lichtenstein, Hopper (antecedente).

### D. Temáticas Especiales & Grabado
- [06. Macabro & Memento Mori](06_macabro_memento_mori.md) — 41 obras (143 MB). Vanitas secular, danzas de la muerte y brujería (exclusión estricta de imaginería devocional cristiana).
- [17. Doré: Divina Comedia](17_dore_divina_comedia.md) — 98 obras (1.176 MB). Grabados monumentales de Gustave Doré para el *Infierno*, *Purgatorio* y *Paraíso* de Dante.

### E. Monográficas Contemporáneas & Arte Oscuro
- [19. Marcelo Canevari](19_marcelo_canevari.md) — 25 obras (37 MB). Naturalismo mágico y fauna salvaje argentina contemporánea.
- [20. Alfred Kubin](20_alfred_kubin.md) — 40 obras (97 MB). Pesadillas gráficas, sátira abisal y criaturas del subconsciente centroeuropeo.
- [21. Rob Gonsalves](21_rob_gonsalves.md) — 25 obras (8 MB). Realismo mágico e ilusionismo arquitectónico/marítimo canadiense.
- [22. Zdzisław Beksiński](22_zdzislaw_beksinski.md) — 25 obras (18 MB). Surrealismo distópico polaco: arquitecturas óseas, crucifixiones místicas y figuras espectrales.
- [23. Mariusz Lewandowski](23_mariusz_lewandowski.md) — 25 obras (15 MB). Paisajes cósmicos colosales, titanes oceánicos y simbolismo metafísico contemporáneo.

### F. Arte asiático
- [24. Ukiyo-e](24_ukiyo_e.md) — 14 obras. Xilografías japonesas del período Edo: Hokusai, Hiroshige, Utamaro, Sharaku, Harunobu y Kuniyoshi. Primera colección armada con el motor genérico.

---

## 3. Estructura de Documentación de cada Galería

Cada archivo individual en esta carpeta responde al estándar:
1. **Ficha y Métricas:** obras, peso, resolución promedio, balance horizontal/vertical.
2. **Concepto Curatorial:** fundamento artístico, criterios de inclusión y canon de calidad.
3. **Fuentes e Ingesta:** APIs o repositorios utilizados, scripts específicos en `tools/`.
4. **Criterios de Exclusión y Descartes:** qué se rechazó y por qué (baja resolución, mockups con paredes, marcas de agua, duplicados).
5. **Obras Maestras de Referencia:** lista de piezas cumbre de la galería.
6. **Integridad Técnica:** correspondencia con `_index.json` y `tools/desc/`.
