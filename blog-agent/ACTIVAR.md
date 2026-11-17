# Activar el agente de blog en un sitio (motor blog-agent · Maguey)

> Igual en todos los sitios. El motor viene **dormido** en los templates (`config.json` → `"enabled": false`):
> el validador solo revisa lo básico y el agente no publica. Se activa cuando se hace la estrategia SEO/GEO
> del sitio.

## Qué es el motor

| Pieza | Dónde | Se edita por cliente |
|---|---|---|
| Manual del agente | `blog-agent/MANUAL.md` | No |
| Validador SEO/GEO | `blog-agent/check-blog.mjs` | No |
| Esta guía | `blog-agent/ACTIVAR.md` | No |
| Config (activo, cadencia, publicación, reglas) | `blog-agent/config.json` | **Sí** |
| Estrategia (clústeres, tema, frontmatter, enlaces, firma, imagen) | `blog-agent/estrategia.md` | **Sí** |
| Backlog y registro | `blog-agent/backlog.md`, `blog-agent/registro.md` | **Sí** (los mantiene el agente) |
| CI | `.github/workflows/blog-check.yml` | No |
| FAQ → JSON-LD, tldr, fuentes | `src/lib/blog-seo.ts` + layout del post | No |

Para actualizar el motor en un sitio existente, copia los archivos de "No" desde el template más reciente.

## Paso 1 · Estrategia SEO/GEO (sesión con Claude)

Pídele a Claude, en el repo del sitio: *"Haz la estrategia SEO/GEO del blog y activa blog-agent"*. Claude debe:

1. Leer `client-brief.md` (debe estar completo: negocio, audiencia, keywords, temas sí/no, guardrails y, en
   salud/seguros, quién revisa). Si faltan datos, preguntar antes de seguir.
2. Investigar keywords (WebSearch, y Ahrefs/Search Console si están disponibles): 3–5 clústeres, cada uno con su
   página destino (servicio o landing), keywords principales y variantes, intención y prioridad.
3. Llenar `blog-agent/estrategia.md` a partir de la plantilla (todas las secciones con `TODO`).
4. Llenar `blog-agent/backlog.md` con 15–30 temas priorizados, **sin gemelos** (mismo tema para otra ciudad o
   segmento con la misma intención) y sin canibalizar posts existentes.
5. Ajustar `blog-agent/config.json`:
   - `"enabled": true` y `reglas.aplicarDesde` = fecha de hoy (los posts anteriores solo pasan validación básica).
   - `sitio`, `cadencia` (recomendado: 2–3 por semana), `publicacion.modo`:
     - `pr-merge`: el agente publica solo si el validador pasa.
     - `pr-revision`: el agente deja un PR y una persona lo aprueba. **Obligatorio si el sitio dice que un
       profesional revisó el contenido** (salud con `reviewedBy`, seguros con revisión de asesor).
   - `reglas`: campos obligatorios, imagen, frases prohibidas propias del cliente.
6. Correr `npm run build && node blog-agent/check-blog.mjs` (auditoría) y abrir PR con todo.

## Paso 2 · Tarea programada

Una tarea por sitio, a una hora fija diaria; el agente decide si toca publicar con `config.json`.

**Importante: la sesión donde corre la tarea tiene que tener el repo del sitio conectado.** Una tarea programada
no puede conectar repos por su cuenta (no tiene `add_repo`): si el repo no está, la ejecución termina en segundos
con "no pude acceder al repo" y no publica nada. Hay dos formas válidas:

1. **Desde claude.ai (recomendada):** crear la tarea en el apartado de tareas programadas / rutinas, con el repo
   del sitio seleccionado como fuente y "sesión nueva en cada ejecución". Cada corrida empieza limpia y con el repo.
2. **Desde una sesión de Claude Code:** crear primero una sesión dedicada al blog del sitio con el repo como fuente
   (`create_session` con `source_url` del repo), confirmar que lo clonó, y crear la tarea con
   `persistent_session_id` de esa sesión. **No** uses `create_new_session_on_fire` desde una sesión: esas corridas
   no heredan el repo.

**Cómo probarla:** espera la primera ejecución programada y revisa que haya leído el manual. Ojo: lanzarla a mano
(`fire_trigger` o "Ejecutar ahora") abre una sesión nueva **sin** el repo aunque la tarea apunte a una sesión dedicada,
así que en la opción 2 no sirve como prueba. Para publicar a mano en la opción 2, escribe el prompt estándar
directamente en la sesión dedicada. Una corrida que termina en menos de un minuto casi siempre significa que no tiene
acceso al repo.

Prompt estándar (solo cambia el repo):

```text
Ejecución automática del agente de blog de <owner>/<repo>: sí debes publicar si toca. Cada ejecución es
independiente: no te bases en lo que recuerdes de ejecuciones anteriores; relee los archivos.
1. Trabaja en el clon de <repo> de esta sesión. git fetch origin main y crea una rama nueva desde origin/main
   (nunca reutilices ramas de ejecuciones anteriores).
2. Lee COMPLETOS, de origin/main: blog-agent/MANUAL.md, blog-agent/config.json y blog-agent/estrategia.md.
   Si no existen, no publiques y termina con "Falta el motor blog-agent en main".
3. Sigue el manual paso a paso. Un solo post por ejecución. Nunca force push. Nunca inventes datos.
Termina con el resumen que pide el manual y envía la notificación push (PushNotification, status proactive)
solo si publicaste o si algo falló.
```

## Paso 3 · Revisión mensual (recomendado)

Una vez al mes, en una sesión con Claude: auditoría (`node blog-agent/check-blog.mjs`), posts que canibalizan
(fusionar o redirigir), posts con impresiones pero bajo CTR en Search Console (mejorar título, `tldr` y FAQ, y
poner `updatedDate`), y repriorizar el backlog.

## Desactivar

`"enabled": false` en `config.json` (el agente deja de publicar en la siguiente ejecución) o pausar la tarea programada.
