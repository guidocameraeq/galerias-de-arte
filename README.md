<p align="center"><img src="docs/assets/banner.svg" alt="Galerías de Arte" width="100%"></p>

# Galerías de Arte

Biblioteca **curada** de obras de arte en **alta resolución**, organizada en 23 colecciones por escuela, época o artista. Cada obra tiene su imagen original (sin editar) y una **ficha en español** sintetizada de una fuente verificable (Wikipedia, museos).

> Repositorio privado, de uso personal. Alimenta una app de galería de arte (modo reposo / slideshow para TV) que vive en **otro proyecto**: este repo es el lado de la **curaduría y la historia del arte**; la app solo consume lo que acá se produce.

## Qué hay acá

| | |
|---|---|
| **Colecciones** | 23 (`01_…` a `23_…`), del Antiguo Egipto a Beksiński |
| **Obras** | 1.382, todas con ficha en español |
| **Volumen** | ~7,4 GB de imágenes (**no** están en git) |
| **Motor** | Node.js 18+, sin Python |

Mapa completo con descripción de cada galería: [`docs/galerias/README.md`](docs/galerias/README.md).

## Principios

1. **Pocas obras excelentes > muchas mediocres.**
2. **Las imágenes no se editan, recortan ni convierten.** Lo que se baja es lo que se muestra.
3. **El archivo en disco es la verdad**, no lo que promete la API.
4. **Piso de resolución:** lado largo ≥ 1000 px (≥ 800 en vanguardias).
5. **Fichas en español, siempre de una fuente**, nunca de memoria.

Reglas completas y trampas conocidas: [`AGENTS.md`](AGENTS.md).

## Cómo está organizado

```
01_…/ … 23_…/     Una carpeta por colección
  ├─ landscape/     Obras horizontales (ancho ≥ alto)
  ├─ portrait/      Obras verticales
  ├─ _index.json    Catálogo: { collection, items: [ficha por obra] }
  └─ _candidatas.json  Lo que NO entró: pendientes importantes y descartadas, con motivo
_descartes/         Registro de lo rechazado y por qué
tools/              Scripts de cosecha, validación y fichas (ver tools/README.md)
docs/               Método, calidad, fuentes, handoff y TODO
```

> Las imágenes viven fuera de git. Ver [`docs/ALMACENAMIENTO.md`](docs/ALMACENAMIENTO.md) para cómo se respaldan y sincronizan.

## Verificar el estado

```bash
node tools/audit.mjs            # solo lectura, ~10 s, sin red
node tools/audit.mjs --col=17   # una colección
```

Chequea formato del índice, existencia y validez de cada imagen, dimensiones reales, fichas y duplicados. Es la única fuente de los números de estado.

## Documentación

| Documento | Para qué |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Entrada para cualquier agente: reglas y trampas |
| [`docs/SESSION_HANDOFF.md`](docs/SESSION_HANDOFF.md) | Dónde quedamos |
| [`docs/TODO.md`](docs/TODO.md) | Pendientes |
| [`docs/INVENTARIO.md`](docs/INVENTARIO.md) | Contrato de datos |
| [`docs/CALIDAD.md`](docs/CALIDAD.md) | Gates de calidad |
| [`docs/DESCRIPCIONES.md`](docs/DESCRIPCIONES.md) | Cómo se hacen las fichas |
| [`docs/FUENTES.md`](docs/FUENTES.md) | APIs y trampas de cada fuente |
| [`docs/METODO.md`](docs/METODO.md) | Cómo se construyó y por qué |
| [`docs/FORMATO_DRIVE.md`](docs/FORMATO_DRIVE.md) | Contrato con la app Museum Slideshow (Drive + `galeria.json`) |
| [`docs/FICHAS_APP.md`](docs/FICHAS_APP.md) | Qué información lleva cada obra en la app |
| [`docs/ALMACENAMIENTO.md`](docs/ALMACENAMIENTO.md) | Dónde viven las imágenes y cómo respaldar/restaurar |
| [`docs/procesos/NUEVA_COLECCION.md`](docs/procesos/NUEVA_COLECCION.md) | Checklist para agregar una colección nueva |
| [`docs/procesos/FLUJO_AGENTES.md`](docs/procesos/FLUJO_AGENTES.md) | Roles y subagentes; qué se registra de cada obra |
| [`docs/galerias/README.md`](docs/galerias/README.md) | Una ficha curatorial por galería |
| [`tools/README.md`](tools/README.md) | Índice de scripts |

## Flujo de trabajo con agentes

Se trabaja con un agente (Claude Code, Gemini CLI, OpenCode…). Dos palabras clave: **"inicio"** para arrancar una sesión y **"cierre"** para dejar todo anotado. Una sesión = una misión. El agente de este repo es el **historiador y curador**; la app que muestra las obras (Museum Slideshow) es otro proyecto con otro agente, y comparten solo el formato de `docs/FORMATO_DRIVE.md`.

## Primeros pasos en una PC nueva

```bash
git clone https://github.com/guidocameraeq/galerias-de-arte.git && cd galerias-de-arte && npm install
node tools/images-sync.mjs restore --dir="RUTA_BIBLIOTECA"   # dry-run; con --apply baja las imágenes de Drive y arma los enlaces
node tools/audit.mjs
```
