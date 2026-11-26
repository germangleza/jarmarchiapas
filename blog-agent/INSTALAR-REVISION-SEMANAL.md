# Instalar la revisión semanal en un sitio con blog-agent (motor Maguey)

> Ciclo de aprendizaje para cualquier sitio que ya tenga el agente de blog corriendo (`blog-agent/MANUAL.md`,
> `config.json`, `estrategia.md`). Cada domingo una tarea programada revisa la semana, decide qué funcionó y qué no
> con evidencia, aplica hasta 3 mejoras y deja todo en un registro. El agente diario lee esas mejoras antes de
> escribir el siguiente post.
>
> **Cómo usar este archivo:** cópialo a `blog-agent/INSTALAR-REVISION-SEMANAL.md` del repo del sitio y pídele a
> Claude, en una sesión con ese repo: *"Instala la revisión semanal siguiendo blog-agent/INSTALAR-REVISION-SEMANAL.md"*.
> Todo lo que hay que crear está aquí dentro; no depende de ningún otro repo.

## Qué se instala

| Pieza | Dónde | Se edita por sitio |
|---|---|---|
| Procedimiento de la revisión | `blog-agent/revision-semanal.md` | No (copiar tal cual, sección A) |
| Script de métricas de contenido | `blog-agent/metricas.mjs` | No (copiar tal cual, sección B) |
| Registro semanal con línea base | `blog-agent/registro-semanal.md` | Sí (lo llena el agente; sección C) |
| Bloque `revisionSemanal` | `blog-agent/config.json` | Sí (sección D) |
| Sección "Aprendizaje semanal" | `blog-agent/estrategia.md` | Sí (sección E) |
| Tarea programada del domingo | claude.ai / Claude Code | Sí (sección F) |

## Pasos de instalación (para Claude)

1. Rama nueva desde `origin/main` (`blog/revision-semanal`). Lee completos `blog-agent/MANUAL.md`,
   `blog-agent/config.json`, `blog-agent/estrategia.md` y `blog-agent/ACTIVAR.md` si existe. Si el motor no existe o
   `config.json` → `enabled` es `false`, **no instales**: el sitio primero necesita su estrategia y el agente activo.
2. Crea `blog-agent/revision-semanal.md` con el contenido de la **sección A**, sin cambios.
3. Crea `blog-agent/metricas.mjs` con el código de la **sección B**, sin cambios. Pruébalo:
   `node blog-agent/metricas.mjs`. Debe listar todos los posts publicados. Si no lista ninguno, revisa
   `config.json` → `contenido.dir`, `contenido.campoFecha` y `contenido.url`; no edites el script para un sitio.
4. Crea `blog-agent/registro-semanal.md` con la plantilla de la **sección C** y llena la línea base con datos reales
   del repo: número de posts por línea o clúster (salida del script), fecha del primer post, temas saltados o
   pendientes que estén anotados en el backlog o registro del sitio. No inventes nada; lo que no sepas, déjalo como
   "sin datos".
5. Agrega a `blog-agent/config.json` el bloque de la **sección D** (antes de `"publicDir"` o al final del objeto).
   Valida el JSON.
6. Agrega a `blog-agent/estrategia.md` la sección de la **sección E**, antes de la sección de verificación del deploy
   (o al final si no existe).
7. Corre `node blog-agent/check-blog.mjs` para confirmar que nada se rompió. Commit
   `blog: ciclo de revisión y mejora semanal (domingos)`, push, PR a `main` y merge con squash (o déjalo para revisión
   si `publicacion.modo` es `pr-revision`).
8. Crea la tarea programada como dice la **sección F**.
9. Dile al usuario: qué se instaló, cuándo corre la primera revisión y que para medir SEO real hace falta conectar
   Search Console a una hoja de Google Sheets (sección G).

---

## A · `blog-agent/revision-semanal.md`

````markdown
# Revisión semanal del blog (cada domingo) — motor blog-agent

> Ciclo de aprendizaje: medir la semana, decidir qué funcionó y qué no, y dejar mejoras concretas para los
> siguientes posts. Lo ejecuta la tarea programada de revisión semanal del sitio. **Esta tarea no publica posts
> nuevos.**
>
> Reglas de oro:
> - **Nada de conclusiones sin datos.** Si no hay datos de Search Console, dilo así y no afirmes que algo
>   "mejoró el SEO". Usa solo lo que puedas verificar.
> - **Paciencia estadística.** Un post nuevo tarda semanas en posicionarse. No cambies una regla por el
>   resultado de un solo post o de una sola semana; busca patrones en 3 o más posts o en 2 o más semanas.
> - **Máximo `config.json` → `revisionSemanal.maxCambiosPorSemana` cambios por semana (3 por defecto)**, cada uno con
>   hipótesis y métrica para revisarlo después.

## Paso 0 · Preparar

1. `git fetch origin main` y crea una rama nueva desde `origin/main` (`blog/revision-AAAA-MM-DD`).
2. Lee completos: `blog-agent/MANUAL.md`, `blog-agent/config.json`, `blog-agent/estrategia.md`, los documentos de
   estrategia, backlog y registro que `estrategia.md` indique, y **`blog-agent/registro-semanal.md`** (las semanas
   anteriores, sobre todo las hipótesis pendientes de revisar).
3. Semana que se revisa: de lunes a domingo, terminando hoy (zona `config.json` → `zonaHoraria`).

## Paso 1 · Inventario de la semana

1. Posts publicados en la semana (por línea o clúster, si el sitio los tiene) contra lo planeado en `config.json` →
   `cadencia` (y `lineas`, si existe).
2. Días en que tocaba publicar y no se publicó, y por qué (ejecución que no corrió, tema saltado, validador, deploy).
3. Temas saltados del backlog y su motivo (canibalización, fuente no verificable, etc.).
4. Deploys: confirma con `mcp__github__actions_list` (workflow de `config.json` → `deploy.workflow`) que los de la
   semana terminaron en `success`.

## Paso 2 · Calidad del contenido (datos del repo)

1. Corre `node blog-agent/metricas.mjs --desde <lunes> --hasta <domingo>` y guarda la tabla.
2. Corre `node blog-agent/check-blog.mjs` sobre los posts de la semana (todos deben pasar).
3. Revisa los posts de la semana contra las reglas de `estrategia.md` y del manual. Señales a buscar:
   - posts sin enlaces desde otros posts o con uno solo (`Enlaces que recibe` = 0 o 1);
   - fuentes externas débiles (blogs de proveedores en vez de fuentes oficiales);
   - respuestas de FAQ largas o vagas, TL;DR que no responde la pregunta completa;
   - repetición de estructura o de frases entre posts (riesgo de contenido "de plantilla");
   - posts que se parecen demasiado entre sí (riesgo de canibalización).

## Paso 3 · SEO real (Search Console)

**Si `config.json` → `revisionSemanal.searchConsole.sheetId` tiene un ID**, lee la hoja con el conector de
Google Sheets y compara la semana contra la anterior y contra el promedio de 4 semanas:

- impresiones, clics, CTR y posición media de cada URL del blog;
- consultas por URL: cuáles traen impresiones, cuáles coinciden con la keyword planeada y cuáles no;
- **oportunidades**: consultas con impresiones que no tienen post dueño (candidatas al backlog), y posts en
  posición 5–20 (candidatos a mejorar);
- páginas sin impresiones después de 3 semanas publicadas (posible problema de indexación o de intención).

**Si no hay hoja configurada o no puedes leerla**, escribe en el registro "Sin datos de Search Console" (y el motivo)
y pasa al Paso 4. No uses estimaciones de herramientas de terceros como si fueran datos del sitio.

## Paso 4 · GEO (¿nos citan los buscadores con IA?)

Auditoría ligera, como proxy (no es ChatGPT ni Perplexity directamente):

1. Toma 5 preguntas que respondan los posts publicados (keywords o preguntas de FAQ). Rota cada semana y cubre todas
   las líneas o clústeres con posts.
2. Para cada una, busca con `WebSearch` tal como la escribiría un usuario.
3. Anota en el registro: si aparece el dominio del sitio (`config.json` → `sitio`) y con qué URL, qué sitios aparecen
   en su lugar y qué tienen que nuestro post no (datos, tabla, definición directa, fecha, autor, fuentes, datos
   locales).
4. Compara con las semanas anteriores del registro: ¿la misma pregunta empezó a mostrar el sitio?

## Paso 5 · Diagnóstico

Escribe en el registro, con evidencia de los pasos 1–4:

- **Qué estuvo bien** (y debe repetirse).
- **Qué estuvo mal** (y por qué).
- **Qué mejoró de verdad el SEO/GEO**: solo cosas respaldadas por Search Console o por la auditoría GEO,
  comparando contra semanas anteriores. Si todavía no hay datos suficientes, dilo.
- **Hipótesis anteriores**: para cada hipótesis pendiente del registro, ¿se confirmó, se descartó o falta tiempo?

## Paso 6 · Mejoras (máximo 3 por semana)

Elige las mejoras con mayor impacto esperado. Cada una debe tener **hipótesis** ("si hacemos X, esperamos Y en la
métrica Z") y **fecha para revisarla** (normalmente 2–4 semanas). Tipos permitidos:

1. **Reglas de escritura** para los siguientes posts: edita `blog-agent/estrategia.md` (estructura, longitud,
   tipo de fuentes, títulos, FAQ, enlazado, tono).
2. **Prioridades de temas**: reordena o agrega temas en el backlog del sitio (por ejemplo, subir una consulta que
   ya trae impresiones), sin crear temas que canibalicen posts existentes.
3. **Refrescar 1 o 2 posts existentes**: mejorar título o descripción con CTR baja, reforzar la respuesta directa,
   agregar una sección que responda una consulta real, enlazar posts huérfanos. Actualiza el campo de fecha de
   actualización si el sitio lo usa y **no cambies** la fecha de publicación, el slug ni la keyword.
4. **Umbrales del validador** en `blog-agent/config.json` → `reglas`, solo si los datos lo justifican.

**No puedes** modificar: `blog-agent/MANUAL.md`, `blog-agent/check-blog.mjs`, `blog-agent/metricas.mjs`, este archivo,
código del sitio, páginas que no sean posts, workflows, `client-brief.md` ni la cadencia (`config.json` → `cadencia`,
`lineas`, `publicacion`). Si crees que hace falta cambiar algo de eso, déjalo como **recomendación para el equipo**.
En sitios con revisión profesional (`publicacion.modo` = `pr-revision`), no cambies afirmaciones clínicas, legales
ni financieras de posts ya revisados.

## Paso 7 · Registro

Agrega al **inicio** de `blog-agent/registro-semanal.md` (debajo del encabezado) una entrada con este formato:

```markdown
## Semana del <lunes> al <domingo>

**Publicado:** N posts (<por línea o clúster>) de N planeados. Faltaron: …
**Datos de Search Console:** sí/no. <resumen: impresiones, clics, CTR, posición; mejores y peores URLs>
**Auditoría GEO:** <pregunta → ¿aparece el sitio? quién aparece>

### Qué estuvo bien
### Qué estuvo mal
### Qué mejoró de verdad (con evidencia)
### Hipótesis anteriores
- <hipótesis> → confirmada / descartada / sin datos aún
### Cambios de esta semana
1. <cambio> — Hipótesis: … — Métrica: … — Revisar el <fecha>
### Recomendaciones para el equipo
- <lo que el agente no puede cambiar solo>
```

## Paso 8 · Validar y publicar

1. Si tocaste posts: build (`config.json` → `build.comando`, si existe) y `node blog-agent/check-blog.mjs <slugs>`.
2. Commit `blog: revisión semanal <fecha>`, push y PR a `main` con el resumen. Merge con squash si
   `publicacion.modo` es `pr-merge`; si es `pr-revision`, deja el PR abierto para revisión.
3. Si tocaste posts y hubo merge, confirma que el deploy terminó en `success`.
4. Notificación push (`PushNotification`, status `proactive`) con 1 línea: lo más importante de la semana y los
   cambios aplicados.

Termina con un resumen breve en español: publicado vs planeado, qué funcionó, qué no, los cambios aplicados y lo que
necesita una decisión del equipo.
````

## B · `blog-agent/metricas.mjs`

Sin dependencias. Lee `config.json` (`contenido.dir`, `contenido.url`, `contenido.campoFecha`, `sitio`,
`zonaHoraria`, `lineas.campo`) y los `.md`/`.mdx` del blog.

```js
#!/usr/bin/env node
/**
 * Métricas de contenido del blog para la revisión semanal (motor blog-agent).
 * Sin dependencias: lee blog-agent/config.json (contenido.dir, contenido.url, contenido.campoFecha,
 * sitio, zonaHoraria, lineas.campo) y los .md/.mdx del blog.
 *
 * Uso:
 *   node blog-agent/metricas.mjs
 *   node blog-agent/metricas.mjs --desde 2026-11-23 --hasta 2026-11-29   (★ = publicado en ese rango)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const cfg = JSON.parse(readFileSync(join(process.cwd(), 'blog-agent', 'config.json'), 'utf-8'))
const args = process.argv.slice(2)
const arg = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null)
const desde = arg('--desde')
const hasta = arg('--hasta')
const tz = cfg.zonaHoraria || 'America/Mexico_City'
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
const dir = join(process.cwd(), cfg.contenido?.dir || 'content/blog')
const campoFecha = cfg.contenido?.campoFecha || 'date'
const plantillaUrl = cfg.contenido?.url || '/blog/{slug}'
const campoLinea = cfg.lineas?.campo || 'linea'
const host = (() => { try { return new URL(cfg.sitio).host.replace(/^www\./, '') } catch { return '' } })()

const frontmatter = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, body: raw }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return { data, body: raw.slice(m[0].length) }
}
const normal = (u) => u.replace(/^https?:\/\/(www\.)?[^/]+/, (h) => (host && h.includes(host) ? '' : h)).replace(/[#?].*$/, '').replace(/\/$/, '') || '/'
const dias = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)
const links = (body) => [...body.matchAll(/\]\(([^)\s]+)|href=["']([^"']+)["']/g)].map((m) => m[1] || m[2])

const posts = readdirSync(dir)
  .filter((f) => /\.mdx?$/.test(f) && !f.startsWith('_'))
  .map((f) => {
    const { data, body } = frontmatter(readFileSync(join(dir, f), 'utf-8'))
    const slug = data.slug || f.replace(/\.mdx?$/, '')
    return { slug, data, body, url: normal(plantillaUrl.replace('{slug}', slug)), fecha: String(data[campoFecha] || '').slice(0, 10) }
  })
  .filter((p) => p.data.draft !== 'true' && p.fecha && p.fecha <= hoy)

const filas = posts
  .map((p) => {
    const ls = links(p.body)
    const faqStart = p.body.search(/^##\s+Preguntas frecuentes\s*$/m)
    return {
      slug: p.slug,
      linea: p.data[campoLinea] || p.data.category || '—',
      keyword: p.data.keyword || '',
      fecha: p.fecha,
      edad: dias(p.fecha, hoy),
      palabras: p.body.trim().split(/\s+/).length,
      h2: (p.body.match(/^##\s+/gm) || []).length,
      faq: faqStart < 0 ? 0 : (p.body.slice(faqStart).match(/^###\s+/gm) || []).length,
      tablas: (p.body.match(/^\|\s*:?-{3}/gm) || []).length,
      externas: new Set(ls.filter((u) => /^https?:\/\//.test(u) && !(host && u.includes(host)))).size,
      salen: ls.filter((u) => u.startsWith('/') || (host && u.includes(host))).length,
      entrantes: posts.filter((o) => o.slug !== p.slug && links(o.body).some((u) => normal(u) === p.url)).length,
      nueva: desde && hasta && p.fecha >= desde && p.fecha <= hasta,
    }
  })
  .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))

console.log(`Métricas del blog de ${cfg.cliente || ''} al ${hoy} · ${filas.length} posts publicados${desde ? ` · ★ = publicado entre ${desde} y ${hasta}` : ''}\n`)
console.log('| | Post | Línea | Keyword | Fecha | Días | Palabras | H2 | FAQ | Tablas | Fuentes ext. | Enlaces que salen | Enlaces que recibe |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for (const f of filas) console.log(`| ${f.nueva ? '★' : ''} | ${f.slug} | ${f.linea} | ${f.keyword} | ${f.fecha} | ${f.edad} | ${f.palabras} | ${f.h2} | ${f.faq} | ${f.tablas} | ${f.externas} | ${f.salen} | ${f.entrantes} |`)
const huerfanos = filas.filter((f) => f.entrantes === 0)
console.log(`\nPosts sin enlaces desde otros posts: ${huerfanos.length ? huerfanos.map((f) => f.slug).join(', ') : 'ninguno'}`)
const porLinea = filas.reduce((m, f) => ({ ...m, [f.linea]: (m[f.linea] || 0) + 1 }), {})
console.log(`Posts por línea: ${Object.entries(porLinea).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
if (desde && hasta) console.log(`Publicados en el rango: ${filas.filter((f) => f.nueva).length}`)
```

## C · `blog-agent/registro-semanal.md` (plantilla)

```markdown
# Registro semanal del blog — <cliente>

Bitácora de la revisión semanal (`blog-agent/revision-semanal.md`). Cada domingo se agrega una entrada **al inicio**.
Las hipótesis se arrastran hasta confirmarse o descartarse.

---

## Línea base (antes de la primera revisión, <fecha>)

**Publicado al <fecha>:** N posts (<por línea o clúster>). Primer post: <fecha>.
**Datos de Search Console:** no conectados todavía (ver recomendación).
**Auditoría GEO:** sin línea base aún; la primera revisión la levanta.

### Contexto que conviene recordar
- <ejecuciones que no corrieron, temas saltados y por qué, limitaciones de fuentes; solo hechos del repo>

### Hipótesis iniciales (revisar con datos)
- Los posts con definición directa en la primera oración y FAQ de 1–3 oraciones serán los primeros en aparecer
  como respuesta en buscadores con IA. — Métrica: auditoría GEO. — Revisar en 3 semanas.

### Recomendaciones para el equipo
- **Conectar Search Console a una hoja de Google Sheets** para que la revisión mida SEO real (impresiones, clics,
  CTR, posición, consultas). Pegar el ID de la hoja en `config.json` → `revisionSemanal.searchConsole.sheetId`.
```

## D · Bloque para `blog-agent/config.json`

```json
"revisionSemanal": {
  "procedimiento": "blog-agent/revision-semanal.md",
  "registro": "blog-agent/registro-semanal.md",
  "dia": "domingo",
  "maxCambiosPorSemana": 3,
  "searchConsole": { "sheetId": null, "nota": "ID de una hoja de Google Sheets con datos de Search Console (fecha, URL, consulta, impresiones, clics, CTR, posición)." }
},
```

## E · Sección para `blog-agent/estrategia.md`

```markdown
## Aprendizaje semanal

Cada domingo, una tarea aparte ejecuta `blog-agent/revision-semanal.md`. Revisa la semana y deja sus conclusiones en
`blog-agent/registro-semanal.md`; puede cambiar estas reglas. **Antes de escribir un post, lee la sección
"Cambios de esta semana" de la entrada más reciente del registro** y aplícala.
```

## F · Tarea programada del domingo

Una tarea por sitio, **separada** de la tarea diaria de publicación. Se configura igual que la diaria
(`ACTIVAR.md` → Paso 2): la sesión donde corre debe tener el repo del sitio conectado.

- **Si la tarea diaria corre en una sesión dedicada** (`persistent_session_id`): crea la del domingo con el mismo
  `persistent_session_id`. Si la creas desde dentro de esa misma sesión, basta con el modo por defecto (dispara en
  la sesión actual).
- **Si la tarea diaria se creó en claude.ai con el repo como fuente y "sesión nueva en cada ejecución"**: crea la del
  domingo igual, desde claude.ai.
- **Horario:** domingo en la noche, hora local del sitio, sin chocar con la tarea diaria ni con las revisiones de
  otros sitios (escalona 10–20 minutos entre sitios). Ejemplo: `CRON_TZ=America/Mexico_City 23 19 * * 0`.
- **Conectores:** si el sitio ya tiene hoja de Search Console, la tarea necesita el conector de Google Sheets.
- **Nombre:** `Blog <cliente>: revisión semanal (domingo)`.

Prompt (cambia `<owner>/<repo>` y `<cliente>`):

```text
Revisión semanal automática del blog de <owner>/<repo> (<cliente>). Esta tarea NO publica posts nuevos: analiza la semana y aplica mejoras. Cada ejecución es independiente: relee los archivos, no te bases en lo que recuerdes.
1. En el clon de <repo> de esta sesión: git fetch origin main y crea una rama nueva desde origin/main (blog/revision-AAAA-MM-DD). Si el repo no está en la sesión, termina con "No tengo el repo en la sesión" y envía la notificación push.
2. Lee COMPLETO, de origin/main, blog-agent/revision-semanal.md y síguelo paso a paso (inventario, métricas con blog-agent/metricas.mjs, Search Console si config.json → revisionSemanal.searchConsole.sheetId tiene ID, auditoría GEO con WebSearch, diagnóstico, máximo 3 mejoras con hipótesis y métrica, entrada nueva al inicio de blog-agent/registro-semanal.md, PR y merge según publicacion.modo). Si el archivo no existe en main, termina con "Falta instalar la revisión semanal en main".
3. Nunca force push. Nunca inventes cifras ni afirmes mejoras de SEO sin datos. No modifiques MANUAL.md, check-blog.mjs, metricas.mjs, código, páginas que no sean posts ni la cadencia.
Termina con el resumen breve que pide el procedimiento y envía la notificación push (PushNotification, status proactive) con lo más importante de la semana y los cambios aplicados.
```

**Cómo probarla:** espera la primera ejecución del domingo y revisa que haya leído `revision-semanal.md` y abierto
el PR del registro. Una corrida que termina en menos de un minuto casi siempre significa que no tenía el repo.

## G · Datos reales de SEO (Search Console → Google Sheets)

Sin estos datos la revisión solo mide calidad de contenido y la auditoría GEO, y no afirma mejoras de SEO.

1. Exporta Search Console a una hoja de Google Sheets (por ejemplo con el complemento "Search Analytics for Sheets"
   con respaldo semanal automático, o con Looker Studio). Columnas: fecha, URL, consulta, impresiones, clics, CTR,
   posición. Una hoja por sitio.
2. Pega el ID de la hoja en `config.json` → `revisionSemanal.searchConsole.sheetId`.
3. Asegúrate de que la tarea del domingo tenga el conector de Google Sheets.
4. Las conclusiones sólidas llegan después de 3–4 semanas con datos.
