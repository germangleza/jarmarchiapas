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
