# Registro semanal del blog — Ópticas Jarmar

Bitácora de la revisión semanal (`blog-agent/revision-semanal.md`). Cada domingo se agrega una entrada **al inicio**.
Las hipótesis se arrastran hasta confirmarse o descartarse.

---

## Línea base (antes de la primera revisión, 2026-11-26)

**Publicado al 2026-11-26:** 66 posts (Tuxtla 21 · Tijuana 22 · General 23, campo `ciudad`). Primer post: 2026-07-01.
- Antes de la campaña 1 (2026-07-01 a 2026-09-03): 30 posts (General 22 · Tijuana 5 · Tuxtla 3).
- Campaña 1 (2026-10-09 a 2026-11-05, diaria; `blog-agent/archivo/`): 30 posts (Tuxtla 15 · Tijuana 15).
- Agente blog-agent (desde 2026-11-13, lunes/miércoles/viernes; `blog-agent/registro.md`): 6 posts
  (Tuxtla 3 · Tijuana 2 · General 1), sin días de publicación faltantes del 13 al 25 de noviembre.

**Datos de Search Console:** no conectados todavía (ver recomendación).
**Auditoría GEO:** sin línea base aún; la primera revisión la levanta.

### Contexto que conviene recordar
- Del 2026-11-06 al 2026-11-12 no se publicó: hueco entre el cierre de la campaña 1 y la activación del agente
  (`reglas.aplicarDesde` = 2026-11-13).
- Solo los 6 posts del agente cumplen las reglas actuales (FAQ, `tldr`, `keyword`, tabla, 900+ palabras). Los 60
  anteriores no tienen sección `## Preguntas frecuentes` ni `keyword` en el frontmatter, y muchos tienen menos de
  900 palabras (salida de `metricas.mjs`).
- 9 posts sin enlaces desde otros posts (`metricas.mjs`, 2026-11-25): miopia-en-ninos-tijuana-lentes-graduacion,
  armazones-para-lentes-tuxtla-como-elegir-jarmar-eyewear, ectasia-despues-de-lasik-lentes-esclerales-tijuana,
  lentes-fotocromaticos-tuxtla, queratocono-chiapas-lentes-esclerales-tuxtla, especialista-queratocono-tijuana,
  el-queratocono-se-cura-mitos-y-realidades, optica-en-tuxtla-donde-comprar-lentes, historia-de-opticas-jarmar-60-anos.
- Temas saltados en la campaña 1 (`archivo/registro-campana-1.md`): examen con seguro de visión en Tijuana
  (canibaliza `usa-tu-seguro-de-vision-en-jarmar`, saltado 5 veces); temas de sucursales y de Tapachula, San
  Cristóbal y Comitán (sin datos locales verificables); Jarmar en tu Empresa Tijuana (sin datos verificables de
  cobertura local). Siguen pendientes en el backlog actual los de sucursales de Tuxtla y Jarmar en tu Empresa.
- El blog tiene muchos pares Tuxtla/Tijuana del mismo tema (astigmatismo, ojo seco, progresivos, diabetes, lentes de
  sol graduados): vigilar canibalización entre ellos cuando haya datos de Search Console.

### Hipótesis iniciales (revisar con datos)
- Los posts con definición directa en la primera oración y FAQ de 1–3 oraciones serán los primeros en aparecer
  como respuesta en buscadores con IA. — Métrica: auditoría GEO. — Revisar en 3 semanas.

### Recomendaciones para el equipo
- **Conectar Search Console a una hoja de Google Sheets** para que la revisión mida SEO real (impresiones, clics,
  CTR, posición, consultas). Pegar el ID de la hoja en `config.json` → `revisionSemanal.searchConsole.sheetId`.
