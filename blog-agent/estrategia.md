# Estrategia del blog — Ópticas Jarmar

> Lo específico de Jarmar para el agente de blog. El flujo general está en `blog-agent/MANUAL.md` (no se edita
> por cliente) y las reglas del validador en `blog-agent/config.json`. Negocio, audiencia, keywords objetivo,
> temas sí/no y guardrails: `client-brief.md`.

## Objetivo

Posicionar a **Ópticas Jarmar** (https://www.jarmar.com) en **Chiapas (Tuxtla Gutiérrez)** y **Tijuana (Zona Río)**
en buscadores (SEO) y en respuestas de IA (GEO), empujando autoridad hacia las páginas de servicio de cada ciudad.
Cadencia: **3 posts por semana** (lunes, miércoles y viernes).

## Cómo elegir el tema

1. Lee `blog-agent/registro.md` (lo publicado por el agente) y `blog-agent/archivo/` (campañas anteriores).
2. **Alterna ciudades:** si el último post del registro fue de Tijuana, hoy toca **Chiapas**, y viceversa. Cada ~4
   posts, uno puede ser **general/nacional** (lentes esclerales, queratocono, salud visual) que enlace a ambas ciudades.
3. Toma el primer tema pendiente (`- [ ]`) de `blog-agent/backlog.md` para esa ciudad, o reemplázalo si tu
   investigación encuentra una oportunidad mejor (anótalo en el registro).
4. **Sin gemelos por ciudad.** El blog ya tiene muchos pares Tuxtla/Tijuana del mismo tema (astigmatismo, ojo seco,
   progresivos, miopía en niños…). No agregues más: si el tema ya existe para la otra ciudad con la misma intención,
   elige otro. Un tema que aplica igual en las dos ciudades se escribe una sola vez como `general`.
5. Tampoco compitas con las páginas de servicio (`/tuxtla/<servicio>/`, `/tijuana/<servicio>/`): el post responde
   una pregunta concreta y enlaza a la página; no la repite.

## Frontmatter exacto

```yaml
---
title: "…"            # 40–70 caracteres, keyword principal al inicio cuando suene natural
description: "…"      # 120–160 caracteres, incluye ciudad y beneficio
pubDate: AAAA-MM-DD   # fecha de hoy
author: "Equipo Ópticas Jarmar"
keyword: "keyword principal"     # única en el blog
tldr: "…"             # 40–60 palabras: respuesta completa a la búsqueda (se muestra arriba del post y va a llms.txt)
tags: ["variante 1", "variante 2", "ciudad"]
sources:              # las fuentes externas que usaste (también enlazadas en el texto)
  - title: "Nombre de la institución — recurso"
    url: "https://…"
draft: false
ciudad: tuxtla        # tuxtla | tijuana | general (general = aplica a las dos ciudades)
servicios: ["lentes-graduados"]   # 1–3 servicios del post, el principal primero
---
```

**`ciudad` y `servicios` son obligatorios** (el build falla sin ellos). Con esos dos campos el sitio relaciona solo
el post con las páginas de servicio: tarjetas al final del post y bloque "Guías…" en `/<ciudad>/<servicio>/`, la
página genérica y el hub de la ciudad.

Servicios válidos (lista en `src/lib/servicios.ts`): `estudio-de-la-vista`, `examen-ninos`, `lentes-graduados`
(incluye progresivos, armazones, micas, lentes para computadora), `lentes-de-contacto`, `lentes-de-sol`,
`lentes-luz-azul`, `lentes-esclerales`, `queratocono`. Si el tema no encaja, usa el más cercano (normalmente
`estudio-de-la-vista`); no inventes slugs.

## Estructura y extensión

900–1,400 palabras, siguiendo el Paso 5 del manual. Además:

- "Ópticas Jarmar" y la ciudad en las primeras 100 palabras.
- Sección local con los datos reales de la sucursal (abajo).
- `## Preguntas frecuentes` con 3–5 preguntas `###` (el layout genera el `FAQPage` JSON-LD con el mismo texto).
- Cierre con CTA de WhatsApp de la ciudad (con `?text=` prellenado) + enlace a la página de servicio.
- **Firma final (todos los posts):**
  `*Contenido elaborado y revisado por el equipo de Ópticas Jarmar. Clínica Óptica Boutique desde 1966.*`
  El autor es siempre **"Equipo Ópticas Jarmar"**. No firmes con nombres de optometristas.

## Enlaces internos

Dentro del texto (además de las tarjetas automáticas):

- La página de servicio de la ciudad (`/tuxtla/<servicio>/` o `/tijuana/<servicio>/`) de cada servicio del
  frontmatter: en el primer tercio del post y otra vez en el cierre. En un post `general`, la de **ambas** ciudades.
- El hub de la ciudad (`/tuxtla/` o `/tijuana/`).
- 2 o más posts relacionados del blog (`/blog/<slug>/`).

Texto del enlace: servicio + ciudad ("lentes progresivos en Tuxtla"), no "clic aquí". Solo rutas que existan (revisa
`src/pages/` y `src/content/blog/`). URLs absolutas siempre con `https://www.jarmar.com` (con www).

## Datos reales que puedes usar (no inventes otros)

- Fundada en **1966**, 60 años, tres generaciones de la familia Aranda. Modelo **Clínica Óptica Boutique** (clínica + óptica + boutique).
- **4.9★ en Google con +880 reseñas** (total de la marca). Línea propia **Jarmar Eyewear** (2022).
- **+10 años** de especialidad en lentes esclerales. Aceptan el **beneficio de visión de cualquier aseguradora**.
- Examen de la vista completo: **30–45 minutos**. Niños desde los **3 años**.
- **Tuxtla Gutiérrez, Chiapas**: Plaza Cedros (Col. Arboledas) — WhatsApp 961 240 6013 (`https://wa.me/529612406013`);
  Plaza Crystal — WhatsApp 961 185 5475 (`https://wa.me/529611855475`). Mapas y citas: `/tuxtla/ubicacionesycitas/`.
- **Tijuana**: David Alfaro Siqueiros #2795, local 101, Zona Urbana Río. Lun–Vie 10:00–18:00, Sáb 10:00–15:00.
  WhatsApp 664 579 1970 (`https://wa.me/526645791970`). **Estacionamiento para pacientes.** Atención en español e inglés.
  Pacientes de EE.UU.: **envío de lentes a domicilio en Estados Unidos** o recogerlos en Zona Río.
- B2B: **Jarmar en tu Empresa** (`/optica-movil/`), óptica móvil en empresas.

## Guardrails (no negociables)

- Sin diagnósticos, sin prometer resultados ("puede mejorar", "depende de cada paciente").
- Sin precios, promociones, descuentos ni garantías específicas. Sin estadísticas inventadas.
- Son **optometristas**: cirugía, crosslinking o trasplante se mencionan como contexto y se deriva a oftalmología.
- Tono cálido, claro, sin jerga, nunca alarmista. Sin comparaciones contra competidores con nombre.
- Siempre invitar a la consulta presencial.

## Imagen de portada (obligatoria)

Elige una foto real de `blog-agent/fotos/catalogo.md` que corresponda al tema y a la ciudad del post (no uses fotos
de la sucursal de Tuxtla en un post de Tijuana ni al revés) y que no se haya usado en los últimos 3 posts del
registro. Genera la portada:

```bash
node blog-agent/portada.mjs <ruta-foto> <slug> [encuadre]   # encuadre: attention (default) | centre | north | south…
```

Crea `public/blog/<slug>.jpg` (1600×900, <300 KB), que el post toma solo. Si el recorte corta una cara, deja solo
techo o piso, o no se entiende, repite con otro encuadre u otra foto. Sin fotos de stock ni imágenes generadas con personas.

## Registro y backlog (Paso 7 del manual)

- Agrega una línea al final de la tabla de `blog-agent/registro.md`:
  `| N | AAAA-MM-DD | Chiapas/Tijuana/General | /blog/<slug>/ | keyword principal | 2–3 variantes | foto usada |`
- Marca el tema como hecho en `blog-agent/backlog.md` (`- [x]`). Si fue un tema nuevo, agrégalo ya marcado.

## Verificación extra antes de publicar

Después de `npm run build`, confirma que la relación quedó hecha:
`grep -l "/blog/<slug>/" dist/<ciudad>/<servicio>/index.html` debe encontrar la página de servicio de cada servicio
del frontmatter (en un post `general`, la de ambas ciudades).
