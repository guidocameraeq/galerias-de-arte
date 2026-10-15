# PLAN.md — Estado de las colecciones

Estados posibles: `pendiente` · `targets listos` · `en descarga` · `completa`

| #  | Colección                      | Estado           | Entraron | Descartadas | Notas |
|----|--------------------------------|------------------|----------|-------------|-------|
| 01 | Mitología griega y romana      | **completa**     | 65       | 1+115       | 33 nombrados + 31 descubrimiento. Met 18 · Cleveland 2 · Wikimedia 45. land 33 / port 32. 392 MB |
| 02 | Barroco                        | **completa**     | 70       | 1+~        | 39 nombrados + 31 descubrimiento. Wikimedia 47 · Met 22 · Cleveland 1. land 27 / port 43. Desc 56/70 |
| 03 | Gótico                         | **completa**     | 60       | ~          | 28 nombrados + 32 descubrimiento. Wikimedia 43 · Met 17. land 18 / port 42 |
| 04 | Romanticismo                   | **completa**     | 63       | ~          | 34 nombrados + 29 descubrimiento. Wikimedia 55 · Met 7 · Cleveland 1. Friedrich/Turner/Church/Delacroix |
| 05 | Egipcio                        | **completa**     | 34       | ~13         | Met 19 · Wikimedia 15. Met dept 10 motor. Re-hecha: anti-facsímil (Wasserman/Budge) + maxYear=1000 a.C.-consciente |
| 06 | Macabro / memento mori         | **completa**     | 39       | ~          | 22 nombrados + 18 descubrimiento. Wikimedia 34 · Met 5. Exclusión cristiana OK (todo muerte secular/vanitas) |
| 07 | Alto Renacimiento (canon)      | **completa**     | 49       | 1           | Wikidata-first. Mona Lisa, Última Cena, David, Escuela de Atenas, Creación de Adán |
| 08 | Impresionismo (canon)          | **completa**     | 67       | -           | Monet, Renoir, Manet, Degas. Impresión sol naciente, Olympia, Nenúfares |
| 09 | Postimpresionismo (canon)      | **completa**     | 55       | -           | Van Gogh, Cézanne, Gauguin, Seurat. Noche estrellada, Girasoles, Grande Jatte |
| 10 | Realismo (canon)               | **completa**     | 39       | -           | Courbet (Origen del mundo), Millet (Ángelus), Repin, Eakins |
| 11 | Rococó (canon)                 | **completa**     | 38       | 2           | Watteau, Fragonard, Boucher, Canaletto, Gainsborough, Tiépolo |
| 12 | Simbolismo/Modernismo (canon)  | **completa**     | 39       | 9           | Klimt (El beso), Munch (El grito), Moreau, Khnopff, Böcklin |
| 13 | Vanguardias (moderno/WikiArt)  | **completa**     | 22       | copyright   | Picasso (Guernica), Matisse, Kandinsky, Mondrian, Klee, Chagall |
| 14 | Surrealismo (moderno/WikiArt)  | **completa**     | 21       | copyright   | Dalí (Persistencia), Magritte, Miró, Ernst, de Chirico |
| 15 | Arte moderno americano/Pop     | **completa**     | 16       | copyright   | Hopper (Nighthawks), Wood (Gótico amer.), Pollock, Rothko, Warhol |
| 16 | Neoclasicismo (canon)          | **completa**     | 41       | -           | David (Sócrates, Horacios, Marat), Ingres, Canova, Thorvaldsen. (Afrodita de Siracusa movida a 01) |
| 17 | Doré · Divina Comedia          | **completa**     | 98       | 57 mov.     | 98 grabados full-res ÚNICOS (dedup visual 155→98; 57 dups/junk en `_dedup_removed/`). Ficha por canto. Excepcional (sin museo/año) |

> ⚠️ **Los conteos 02-13 de la tabla son de la FASE ORIGINAL.** El gap-fill del 2026-06-16 (+330 obras)
> los aumentó (p.ej. 02→124, 03→101, 07→93, 13→44…). **Totales reales actuales (2026-06-28): 17 col ·
> 1102 obras · 1102 con ficha (100%) · 0 huérfanos** (ver `START_HERE.md` / `CLAUDE.md`).

## 🔧 Backlog vigente (act. 2026-06-28) — curaduría
1. **`_dedup_removed/` (col 17, 57 grabados, 690 MB):** son los duplicados de edición + 1 junk (astronomía
   1904) que saqué de la colección Doré. **MOVIDOS, no borrados** (por si erré algún descarte). Revisar y
   decidir: borrar definitivamente (libera 690 MB) o conservar. Recuperar un grabado = moverlo de vuelta + reindexar.
2. **Romeo y Julieta (Wright of Derby)** en 10 n63: el original de Commons es solo **750×563** (< piso 1000) →
   buscar mejor versión (sitio del Derby Museum / otra fuente PD) o aceptar la baja-res.
3. **Busto de Nefertiti** (05): foto de Berlín **restringida** (sin P18 PD usable) → buscar alternativa PD/CC0
   o aceptar que no entra. Es problema de LICENCIA, no de resolución.
4. **Modernas con copyright sin alta-res** (Frida, Lichtenstein *Whaam!*/*Drowning Girl*, Warhol *Marilyn*,
   Pollock *Autumn Rhythm*, Dalí *Cristo de S. Juan*, O'Keeffe *Ram Skull*) → best-effort con navegador.
5. **Mejoras menores:** 2 Schiele en col 13 rozan el piso (PD, mejorables vía Wikidata); `holding_museum`
   vacío en parte de las modernas; ~387 obras sin `title_es` (cosmético).
6. **RESUELTO 2026-06-28:** (a) **col 17 Doré rescatada** — los 155 archivos eran páginas de error HTML →
   re-bajados full-res + dedup visual 155→98. (b) **9 obras sin descripción** → 8 escritas a mano + el
   "grabado sin canto" (Lucifer) asignado a Inferno 34 = **100% fichas (1102/1102)**. (c) **Afrodita de
   Siracusa**: autor falso "Canova" corregido a anónima grecorromana y movida 16→01. (d) **Ernst "Europa
   después de la lluvia"**: verificado, NO es recorte (formato real 54,8×147,8 cm = ratio 2,7). (e) escriba
   05 con museo corregido (Lyon→Grenoble); Copérnico año 1850→1830.
7. **Resuelto antes:** dup *Rokeby Venus*, *Man Reading* (02), *Amaranth* (12), item basura 07 "ética ambiental".

## Modo de trabajo (histórico, 2026-06-13 — ya cumplido)
Run autónomo: completar colecciones 02→06 sin consultar. Excepción 06: exclusión dura de
temática cristiana/Jesús. (Bloque conservado como registro; la fase está cerrada.)

## Metodología por colección
1. Armar `_targets.md` (research de historia del arte) → **mostrar antes de buscar**.
2. Buscar cada target en las APIs + barrido por departamento/subject (descubrimiento).
3. Filtrar (dominio público + resolución ≥1000px; preferir grande en descubrimiento).
4. Bajar original → nombrar (convención) → clasificar landscape/portrait → registrar en `_index.json`.
5. Actualizar este PLAN.md + loguear descartes.

## Pipeline por colección (comandos)
```
node tools/collect.mjs --max=65        # resuelve targets + descubre + descarga + indexa + mide real
node tools/cleanup-names.mjs <col> --apply   # normaliza title/artist/year y renombra (idempotente)
node tools/fix-dims.mjs <col> --apply        # verificación: re-mide del disco (debería dar 0 ahora)
```
(Para 02-06 hay que crear `tools/targets-0X.mjs` y un runner análogo, o generalizar `collect.mjs`.)

## Colecciones Fase 3 — Canon Europeo (completas)
| #  | Colección | Obras | Íconos |
|----|-----------|-------|--------|
| 07 | Alto Renacimiento | 49 | Mona Lisa, Última Cena, David, Escuela de Atenas, Creación de Adán |
| 08 | Impresionismo | 67 | Impresión sol naciente, Olympia, Nenúfares, ballet de Degas |
| 09 | Postimpresionismo | 55 | Noche estrellada, Girasoles, La Grande Jatte, Cézanne, Gauguin |
| 10 | Realismo | 39 | Courbet (El origen del mundo), Millet (Ángelus), Repin, Eakins |
| 11 | Rococó | 38 | El joven azul, El columpio, Mr & Mrs Andrews, Canaletto |
| 12 | Simbolismo/Modernismo | 39 | El grito, El beso (Klimt), Munch, Moreau, Khnopff, Böcklin |

## TODO autónomo (Fase 4) — orden de trabajo
1. **13 Vanguardias** (bajado 19, mixto): podar <1000px; recuperar vía navegador las 3 que faltan
   (Weeping Woman, Three Musicians, The Dance) + mejorar Kandinsky/Schiele si hay versión grande.
2. **14 Surrealismo** — crear `tools/wikiart/14_surrealismo.mjs` (Dalí, Magritte, Miró, Ernst, de Chirico,
   Frida Kahlo), bajar, podar <1000, recuperar clave con navegador.
3. **15 Arte moderno americano/Pop** — `tools/wikiart/15_pop_americano.mjs` (Hopper, Wood, Wyeth, Pollock,
   Rothko, Warhol, Lichtenstein, O'Keeffe), ídem.
4. **Descripciones** (es) de 13/14/15 vía `apply-desc` (autoradas).
5. **Revisar 01-12 con navegador:** detectar obras importantes con lado largo <1500px y buscar mejor
   versión (WikiArt/Google Imágenes) sin romper lo bueno. Re-medir e indexar.
6. **Reporte final** al usuario: decisiones, resultados, fuertes, a mejorar, a revisar.

## Log de avance
- **2026-06-28** — **RESCATE + DEDUP DE LA COL 17 (DORÉ) + 100% FICHAS. 1159 → 1102 obras.**
  Hallazgo crítico: los **155 archivos Doré eran páginas de error HTML de 2 KB** (descarga full-res
  rate-limited 429, servida con HTTP 200, guardada como `.jpg` por `downloadTo` que no valida contenido).
  Re-bajados los 155 full-res (`dore-redownload.mjs`: imageinfo→URL, valida magic bytes, throttle).
  **Dedup visual** (las ~4 ediciones duplicaban planchas): revisión por hojas de contacto
  (`dore-montage.mjs`) + dHash 256-bit calibrado (`dore-dedup.mjs`) → **155→98 únicas**; 57 dups/junk
  (incl. imagen de un libro de astronomía 1904 colada) **movidos** a `_dedup_removed/` (`dore-dedup-apply.mjs`).
  **+8 descripciones a mano** (05 escriba, 10 Romeo/La danza, 13 Alice, 16 Copérnico/Johnson/Poniatowski)
  + Lucifer→Inferno 34 ⇒ **1102/1102 con ficha (100%)**. **Afrodita de Siracusa** (autor falso "Canova")
  corregida a anónima grecorromana y **movida 16→01** (`move-aphrodite.mjs`). Verificado Ernst "Europa…"
  no es recorte. Correcciones: escriba museo Lyon→Grenoble, Copérnico 1850→1830. 0 huérfanos, ~5.8 GB.
- **2026-06-16** — **Nueva colección 17 Doré · Divina Comedia (155 grabados full-res).** A pedido del
  usuario (su obra favorita). De Commons, con **dedup VISUAL** (`dore.mjs`: average-hash de thumbs con
  `sharp`, umbral Hamming 12 — calibrado: mismo grabado=3, distintos=26+). Camina categorías por canto,
  filtra basura (coloreados/fotos de página). Hasheo+descarga en paralelo (pools) tras un primer intento
  que murió por timeout. 2404-7517px, 102 vert/53 apais. **Pendiente:** títulos mixtos es/en + sin
  descripción (la escena está en el título). **PROYECTO: 17 colecciones, 1162 obras, ~4.7 GB.**
  Dup detectado a resolver: Rokeby Venus (01 baja-res vs 02 alta-res).
- **2026-06-16** — **GAP-FILL DEL CANON. 677 → 1007 obras (16 colecciones).** Análisis de brechas
  vs ranking de fama de Wikidata (`gap.mjs`): de las top-250 pinturas faltaban ~90, todas PD.
  Llenado con `canon.mjs` (configs nuevos 02/03/04/13/16 + ampliados 07/10/12): +320 obras.
  Nueva colección **16 Neoclasicismo** (David, Ingres, Canova). Esculturas antiguas anónimas
  (`sculptures.mjs`) → Laocoonte/Venus de Milo/Victoria de Samotracia/Discóbolo/Loba a la 01,
  Tutankamón+Escriba a la 05. Descripciones es **vía QID→sitelink es.wikipedia** (`enrich-es.mjs`,
  100% preciso, sin mislabel) + ~18 a mano (`gap-desc.mjs`). 999/1007 con ficha. Dedup robusto
  (qid+título_en+título_es). Eliminado 1 item basura (07 "ética ambiental", error de Wikidata).
  **Pendiente menor:** Busto de Nefertiti no resolvió; 8 obras nicho sin descripción es.
- **2026-06-15** — **FASE 4 COMPLETA + PROYECTO CERRADO (run autónomo).** Modernas con copyright vía
  WikiArt (og:image + text-list resolver, parser arreglado para no mislabel): 13 Vanguardias (22),
  14 Surrealismo (21), 15 Pop/Americano (16) = 59 íconos correctos ≥800px, descriptos. GA&C gigapíxel
  descartado (tiles encriptados). Revisión 01-12: solo 31/677 estaban <1400px → ya eran alta-res;
  2 mejoradas (Monet Ruan, Caillebotte Pont de l'Europe). **TOTAL: 677 obras, 15 colecciones,
  677/677 descriptas, 0 huérfanos, ~3.1 GB.** No entraron por res inusable (copyright): Frida (3),
  Lichtenstein (Whaam, Drowning Girl), Warhol Marilyn, Pollock Autumn Rhythm, Dalí Christ of St John,
  O'Keeffe Ram Skull. Tools: `wikiart.mjs`, `prune-modern.mjs`, `upgrade.mjs`.
- **2026-06-15** — **FASE 3 COMPLETA: Canon Europeo (287 obras nuevas, 07-12).** Adquisición Wikidata-first
  (`canon.mjs`): QID→P18→descarga, con museo/fama/movimiento/año del propio item. Todas con ficha
  completa (descripción es + técnica + museo + canon_rank). Poda de calidad `prune-canon.mjs` (9 obras
  diminutas/dup). **TOTAL PROYECTO: 618 obras, 618/618 descriptas, 0 huérfanos, ~3.0 GB, 12 colecciones.**
  Pendiente (cuando el usuario quiera): modernas con copyright (Chrome MCP), burn de captions, visor HTML.
- **2026-06-15** — **Fase 3 en marcha (Canon Europeo, Wikidata-first).** Tool `canon.mjs` (QID→P18→
  descarga) + configs `tools/canon/<col>.mjs`. Listas: **07 Alto Renacimiento (49)** y **08 Impresionismo
  (67)** bajadas y con ficha completa (descripción es + técnica + museo + canon_rank). En cola: 09 Postimp,
  10 Realismo, 11 Rococó, 12 Simbolismo. Aprendizajes: filtrar autor por "pintor + más sitelinks" (homónimos);
  reintentar autores que dan 502; podar glitches de Wikidata (ej. "ética ambiental" como Rafael). Modernas
  con copyright = vía Chrome MCP al final.
- **2026-06-15** — **Fase 2: DESCRIPCIONES DE LAS 331 COMPLETAS.** Las 6 colecciones con ficha
  completa en `_index.json`: descripción en español (meaning-focused, ~4 frases), `title_es`,
  `school`, `type`, `holding_museum` (264/331; el resto son extras oscuros sin museo confiable) y
  `canon_rank`. Autoradas por el agente (consenso art-histórico), en `tools/desc/<col>.mjs`.
  Imágenes intactas. **Próximo:** poda opcional de extras flojos + el "burn" de captions
  (`_captioned/`) y/o visor HTML con globito — recién cuando la colección esté cerrada.
- **2026-06-15** — **Fase 2 arrancada. Piloto de descripciones (col 01) CERRADO.** Formato validado
  por el usuario: ficha = título_es · año / autor · escuela / técnica · museo + descripción ampliada
  (~4 frases, español, con sentido). 65/65 fichas, 60/65 con museo real. Tools nuevos: `wikidata-enrich.mjs`
  (museo P195 por fuente/Wikidata + canon_rank + técnica), `apply-desc.mjs` + `tools/desc/<col>.mjs`
  (descripciones autoradas). Pendiente: escalar a col 02-06 (266 obras). Burn de captions = al final.
- **2026-06-14** — **PROYECTO COMPLETO: las 6 colecciones listas** (331 obras, ~1.4 GB).
  05 egipcio (34) re-hecha con anti-facsímil + `maxYear=1000` a.C.-consciente; 06 macabro (39)
  con exclusión cristiana verificada (0 coladas). QA final: 0 huérfanos/faltantes/basura en
  las 6, 0 duplicados entre colecciones. Descripciones 266/331. Falta: poda fina opcional +
  revisión conjunta con el usuario. (1 obra no bajó: Bosch *Death and the Miser*, HTTP 500.)
- **2026-06-14** — **Colecciones 03 (Gótico, 60) y 04 (Romanticismo, 63) COMPLETAS** (autónomo).
  Aprendizajes del motor: (1) **anti-IA/moderno** — las categorías temáticas amplias de Wikimedia
  ('Mountains in art', 'Skulls in art') traen arte digital/IA → solo categorías por-artista +
  filtro `MODERN` + `maxYear` (04→1900, 06→1910); (2) **dedup por contenido** (título+autor y
  autor+dimensiones) cazó 3× *The Natchez*; (3) `downloadTo` reintenta con backoff (un fallo de
  red "terminated" cortaba la corrida). Pendiente enriquecer 03/04/05/06.
- **2026-06-13** — **Colección 02 (Barroco) COMPLETA**: 70 obras (Wikimedia 47, Met 22,
  Cleveland 1), 0 fallos. 39/41 nombrados (cae solo Bernini escultura). Descripciones 56/70.
  Motor generalizado con `--col` + registro; fixes: bug de acentos en resolver, dedup entre
  colecciones, filtro de títulos basura, depto Met acotado, soporte de exclusión para la 06.
- **2026-06-13** — Enriquecido `_index.json` de la col. 01 con descripciones cortas:
  56/65 con texto (Wikipedia 36, Met-datos 9, Commons 9, Cleveland 2); 9 extras
  oscuros sin artículo. Nuevo tool `enrich-desc.mjs` (match verificado, sin re-bajar).
- **2026-06-13** — Colección 01 (mitología) COMPLETA:
  - 65 obras bajadas (0 fallos): 34 targets nombrados que resolvieron + 31 del barrido.
  - Todas dominio público/CC0, ≥1000px, original más grande usable, sin editar.
  - Met 18 · Cleveland 2 · Wikimedia 45. Orientación 33 landscape / 32 portrait. 392 MB.
  - Descartes: #28 (escultura Giambologna, sin foto PD) + ~115 candidatos <1920px del barrido.
  - Aprendizaje clave: **Wikimedia clampea renders grandes a ~3840px** → siempre medir el
    archivo real post-descarga (ya implementado en collect.mjs). Índice veraz.
  - Tooling: lib.mjs, resolve.mjs, discover.mjs, collect.mjs, cleanup-names.mjs, fix-dims.mjs.
- **2026-06-13** — Setup inicial del proyecto:
  - Entorno verificado: Node v26 (sin Python/Pillow → motor en Node). Met/AIC/Cleveland OK.
  - Calibración Met: `hasImages=true`+`departmentId` rompe → estrategia ajustada (ver CLAUDE.md).
  - Medición de imágenes sin Pillow validada (Range request + parser de cabecera JPEG/PNG).
  - Estructura de carpetas + CLAUDE.md + PLAN.md creados.
  - `_targets.md` de la colección 01 (mitología) armado.
  - **BLOQUEADO esperando OK del usuario** para arrancar la descarga masiva.
