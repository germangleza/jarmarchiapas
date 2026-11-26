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
