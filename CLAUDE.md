# CLAUDE.md — Ópticas Jarmar

Sitio en **Astro** (estático, deploy en Vercel). Dominio de producción: **https://www.jarmar.com** (canónico **con www**; el apex redirige 301).

## Contexto para contenido

**Antes de escribir o modificar contenido, lee [`client-brief.md`](./client-brief.md)** — ahí están el negocio, la audiencia, el posicionamiento, las keywords objetivo, los temas sí/no y las restricciones de salud (guardrails de claims y médicos revisores). Los datos administrativos del cliente están en [`cliente.json`](./cliente.json).

Es un sitio de **vertical salud**: no dar diagnósticos, no prometer resultados, no inventar precios ni promociones, y siempre invitar a consulta presencial.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| **Config del cliente** (nombre, URL, marca, colores, fuentes, guardrails) | `site.config.mjs` |
| Config de Astro | `astro.config.mjs` |
| **Posts del blog** | `src/content/blog/*.md` — un archivo por post |
| Schema del frontmatter de los posts | `src/content.config.ts` |
| **Imágenes de los posts** | `public/blog/<slug>.jpg` — mismo nombre que el `.md`, se enlaza sola (ver `public/blog/README.md`) |
| Layout base (head, nav, footer, analítica, schema Organization) | `src/layouts/BaseLayout.astro` |
| Layout de post | `src/layouts/BlogPostLayout.astro` |
| Páginas | `src/pages/` |
| Estilos globales | `src/styles/global.css` |
| Sitemap y llms.txt (dinámicos) | `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts` |
| Redirects 301 | `vercel.json` |

## Estructura de páginas

Los servicios viven en **3 niveles**:

- **Genérica** (sin ciudad): `/lentes-esclerales`, `/estudio-de-la-vista`, `/lentes-graduados`, `/lentes-de-contacto`, `/lentes-de-sol`, `/lentes-luz-azul`, `/examen-ninos`
- **Chiapas**: `/chiapas/<servicio>`
- **Tijuana**: `/tijuana/<servicio>`
- **Inglés** (Tijuana / cross-border): `/en/tijuana/<service>`

Cada nivel tiene canonical propio — **no** canonicalizar las de ciudad hacia la genérica, y evitar texto duplicado entre ellas.

Otras: `/` (hub nacional), `/chiapas/`, `/tijuana/`, `/historia/` (+ `/en/history/`), `/blog/`, `/optica-movil/` (B2B), perfiles de optometristas (`/jorgearanda/`, `/aaronlinares/`, `/hectorpineda/`).

⚠️ **Nota de arquitectura:** `/`, `/chiapas/`, `/tijuana/`, `/en/tijuana/`, `/tijuana/examen`, `/optica-movil` y los perfiles son **páginas standalone** — tienen su propio `<head>` y **no usan `BaseLayout`**. Un cambio global (analítica, meta, schema) hay que replicarlo en cada una.

## Crear un post

1. Nuevo `.md` en `src/content/blog/` con frontmatter: `title`, `description`, `pubDate`, `author`, `tags`, `draft`. Opcional `image` (solo si la imagen no es `.jpg`).
2. Subir la imagen a `public/blog/<slug>.jpg` (16:9, ~1600×900, <300 KB).
3. Enlazar a las páginas de servicio relevantes y a otros posts del clúster.
4. Cerrar los posts clínicos con el revisor (ver `client-brief.md` → Salud).

El sitemap, `llms.txt` y el ping de IndexNow se actualizan solos en el build/deploy.

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build a dist/ — correr antes de cada commit
npm run preview  # previsualizar el build
```

## Convenciones

- **Scripts en `<head>` de páginas standalone**: usar `is:inline`, si no Astro los compila como módulo y rompe los globales (p. ej. `gtag`).
- **Imágenes**: nombres en kebab-case, sin espacios ni acentos. Al renombrar, agregar el 301 en `vercel.json`.
- **URLs absolutas**: siempre `https://www.jarmar.com` (con www).
- **Schema**: si se agrega una FAQ visible, agregar también su `FAQPage` JSON-LD con **texto idéntico**.
