#!/usr/bin/env node
/**
 * Validador de calidad SEO/GEO del blog — motor blog-agent (Maguey).
 * Es el MISMO archivo en todos los repos; lo específico de cada cliente vive en
 * blog-agent/config.json. No edites este archivo para un solo cliente.
 *
 * Uso:
 *   node blog-agent/check-blog.mjs <slug> [...]      estricto para esos posts
 *   node blog-agent/check-blog.mjs --changed <ref>   estricto para los posts que cambiaron vs <ref> (CI)
 *   node blog-agent/check-blog.mjs --estricto        estricto para todos los posts
 *   node blog-agent/check-blog.mjs                   auditoría: reporta todo, no falla
 *
 * Reglas:
 *   - Posts "vigentes" (fecha >= reglas.aplicarDesde y sistema activo): checklist completo.
 *   - Posts anteriores o sistema dormido: solo lo básico (enlaces rotos, frases
 *     prohibidas, slug). Así los posts viejos no bloquean, pero tampoco se rompen.
 *   - Si existe la carpeta de build (config.build.dist), los enlaces internos se
 *     comprueban contra ella. Corre el build antes para la validación completa.
 *
 * Sale con código 1 si algún post en modo estricto tiene errores.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const HERE = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(HERE, 'config.json'), 'utf-8'));
const R = cfg.reglas || {};
const C = cfg.contenido;

// ---------- YAML (usa la librería que ya tenga el proyecto) ----------
const require = createRequire(join(ROOT, 'package.json'));
let parseYaml;
for (const lib of ['js-yaml', 'yaml']) {
  try {
    const m = require(lib);
    parseYaml = lib === 'js-yaml' ? (s) => m.load(s) : (s) => m.parse(s);
    break;
  } catch {}
}
if (!parseYaml) {
  console.error('❌ No encontré js-yaml ni yaml en node_modules. Corre `npm ci` primero.');
  process.exit(2);
}

// ---------- args ----------
const args = process.argv.slice(2);
let strictAll = args.includes('--estricto');
let only = args.filter((a) => !a.startsWith('--'));
const changedIdx = args.indexOf('--changed');
if (changedIdx !== -1) {
  const ref = args[changedIdx + 1];
  only = only.filter((a) => a !== ref);
  const out = execSync(`git diff --name-only --diff-filter=AM ${ref}...HEAD -- ${C.dir}`, { encoding: 'utf-8' });
  only = out.split('\n').filter((f) => /\.mdx?$/.test(f)).map((f) => f.split('/').pop().replace(/\.mdx?$/, ''));
  if (!only.length) {
    console.log('Sin posts modificados. Nada que validar.');
    process.exit(0);
  }
}
const audit = !strictAll && only.length === 0;

// ---------- helpers ----------
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d || '').slice(0, 10));
const site = String(cfg.sitio || '').replace(/\/$/, '');
const siteHost = site ? new URL(site).host.replace(/^www\./, '') : '';
const isExternal = (u) => /^https?:\/\//.test(u) && !(siteHost && new URL(u).host.replace(/^www\./, '') === siteHost);
const toInternal = (u) => {
  if (u.startsWith('/')) return u;
  if (/^https?:\/\//.test(u) && !isExternal(u)) return new URL(u).pathname + (new URL(u).hash || '');
  return null;
};
const distDir = cfg.build?.dist ? join(ROOT, cfg.build.dist) : null;
const hasDist = distDir && existsSync(distDir);
const publicDir = join(ROOT, cfg.publicDir || 'public');
const known = new Set((cfg.rutasConocidas || []).map((p) => p.replace(/\/$/, '') || '/'));
const blogPrefix = (C.url || '/blog/{slug}/').split('{slug}')[0];

function routeExists(path) {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  const noSlash = clean.replace(/\/$/, '') || '/';
  if (known.has(noSlash)) return true;
  if (existsSync(join(publicDir, noSlash)) && noSlash !== '/') return true;
  if (!hasDist) return null; // no se puede saber sin build
  const cands = noSlash === '/' ? ['index.html'] : [`${noSlash}/index.html`, `${noSlash}.html`, noSlash];
  return cands.some((c) => existsSync(join(distDir, c)) && statSync(join(distDir, c)).isFile());
}

function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  return { data: parseYaml(m[1]) || {}, body: raw.slice(m[0].length) };
}

function faqSection(body) {
  const start = body.search(/^##\s+Preguntas frecuentes\s*$/m);
  if (start === -1) return null;
  const rest = body.slice(start).split('\n').slice(1).join('\n');
  const end = rest.search(/^##\s+/m);
  return end === -1 ? rest : rest.slice(0, end);
}

// ---------- cargar posts ----------
const dir = join(ROOT, C.dir);
const files = readdirSync(dir).filter((f) => /\.mdx?$/.test(f) && !f.startsWith('_'));
const posts = files.map((f) => {
  const { data, body } = splitFrontmatter(readFileSync(join(dir, f), 'utf-8'));
  return { file: f, data, body, slug: data.slug || f.replace(/\.mdx?$/, '') };
});
const published = posts.filter((p) => !p.data.draft);
const slugs = new Set(published.map((p) => p.slug));
const kwOwner = new Map();
for (const p of published) {
  const kw = String(p.data.keyword || '').toLowerCase().trim();
  if (kw && !kwOwner.has(kw)) kwOwner.set(kw, p.slug);
}
const aplicarDesde = cfg.enabled && R.aplicarDesde ? R.aplicarDesde : null;
const prohibidas = (R.frasesProhibidas || []).map((f) => f.toLowerCase());

// ---------- validar ----------
let failed = 0;
let warnedPosts = 0;
for (const p of posts) {
  const strict = !audit && (strictAll || only.includes(p.slug));
  if (!strict && !audit) continue;
  if (p.data.draft && !only.includes(p.slug)) continue;

  const d = p.data;
  const fecha = iso(d[C.campoFecha]);
  const vigente = Boolean(aplicarDesde && fecha >= aplicarDesde);
  const errors = [];
  const warns = [];

  // Básico (todos los posts)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`slug inválido: ${p.slug} (kebab-case, sin acentos)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) errors.push(`${C.campoFecha} debe ser YYYY-MM-DD`);
  const texto = (JSON.stringify(d) + '\n' + p.body).toLowerCase();
  for (const f of prohibidas) if (texto.includes(f)) errors.push(`frase prohibida por config: "${f}"`);

  const links = [...p.body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
  const internal = links.map(toInternal).filter(Boolean);
  const blogLinks = internal.filter((l) => l.startsWith(blogPrefix) && l.length > blogPrefix.length);
  const pageLinks = internal.filter((l) => !blogLinks.includes(l));
  for (const l of blogLinks) {
    const s = l.slice(blogPrefix.length).split(/[/#?]/)[0];
    if (!slugs.has(s)) errors.push(`enlace a post inexistente o en borrador: ${l}`);
  }
  for (const l of pageLinks) {
    const ok = routeExists(l);
    if (ok === false) errors.push(`enlace interno roto: ${l}`);
    if (ok === null) warns.push(`no pude comprobar ${l} (corre el build primero)`);
  }
  if (cfg.urlCanonica && links.some((l) => /^https?:\/\//.test(l) && !isExternal(l) && !l.startsWith(site)))
    errors.push(`URL absoluta propia sin el dominio canónico (${site})`);

  // Checklist completo (posts vigentes)
  if (vigente) {
    for (const k of R.camposObligatorios || []) {
      const v = d[k];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) errors.push(`falta "${k}" en el frontmatter`);
    }
    const len = (s) => String(s || '').length;
    if (R.titulo && d.title && (len(d.title) < R.titulo.min || len(d.title) > R.titulo.max))
      errors.push(`title de ${len(d.title)} caracteres (${R.titulo.min}–${R.titulo.max})`);
    if (R.descripcion && d.description && (len(d.description) < R.descripcion.min || len(d.description) > R.descripcion.max))
      errors.push(`description de ${len(d.description)} caracteres (${R.descripcion.min}–${R.descripcion.max})`);
    if (R.tldr && d.tldr && (words(d.tldr) < R.tldr.min || words(d.tldr) > R.tldr.max))
      errors.push(`tldr de ${words(d.tldr)} palabras (${R.tldr.min}–${R.tldr.max})`);

    if (R.keywordUnica && d.keyword) {
      const owner = kwOwner.get(String(d.keyword).toLowerCase().trim());
      if (owner && owner !== p.slug) errors.push(`canibalización: la keyword "${d.keyword}" ya es de /${owner}`);
    }

    const bodyWords = words(p.body.replace(/```[\s\S]*?```/g, '').replace(/[#*_>|`-]/g, ' '));
    if (R.palabras?.min && bodyWords < R.palabras.min) errors.push(`${bodyWords} palabras (mínimo ${R.palabras.min})`);
    if (R.palabras?.max && bodyWords > R.palabras.max) warns.push(`${bodyWords} palabras (máximo sugerido ${R.palabras.max})`);

    const h2 = (p.body.match(/^##\s+/gm) || []).length;
    if (R.minH2 && h2 < R.minH2) errors.push(`solo ${h2} H2 (mínimo ${R.minH2})`);
    const h2q = (p.body.match(/^##\s+¿/gm) || []).length;
    if (R.minH2Pregunta && h2q < R.minH2Pregunta) errors.push(`${h2q} H2 en forma de pregunta (mínimo ${R.minH2Pregunta})`);

    if (R.faq?.requerida) {
      const faq = faqSection(p.body);
      if (faq === null) errors.push('falta "## Preguntas frecuentes"');
      else {
        const q = (faq.match(/^###\s+/gm) || []).length;
        if (q < (R.faq.minPreguntas || 3)) errors.push(`FAQ con ${q} preguntas (mínimo ${R.faq.minPreguntas || 3})`);
        if (R.faq.maxPreguntas && q > R.faq.maxPreguntas) warns.push(`FAQ con ${q} preguntas (máximo sugerido ${R.faq.maxPreguntas})`);
      }
    }
    if (R.tabla && !/^\|.*\|\s*$\n^\|\s*:?-{3,}/m.test(p.body)) errors.push('sin tabla (mínimo 1)');

    const ext = new Set([...links.filter(isExternal), ...((d.sources || []).map((s) => s.url))]);
    if (R.minFuentesExternas && ext.size < R.minFuentesExternas) errors.push(`${ext.size} fuentes externas (mínimo ${R.minFuentesExternas})`);
    if (R.minEnlacesInternos && new Set(pageLinks).size < R.minEnlacesInternos)
      errors.push(`${new Set(pageLinks).size} enlaces a páginas del sitio (mínimo ${R.minEnlacesInternos})`);
    if (R.minEnlacesPosts && published.length > R.minEnlacesPosts && new Set(blogLinks).size < R.minEnlacesPosts)
      errors.push(`${new Set(blogLinks).size} enlaces a otros posts (mínimo ${R.minEnlacesPosts})`);
    if (R.enlaceEnIntro) {
      const intro = p.body.split(/\s+/).slice(0, 170).join(' ');
      const introLinks = [...intro.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => toInternal(m[1])).filter((l) => l && !l.startsWith(blogPrefix));
      if (!introLinks.length) errors.push('no enlaza una página del sitio en las primeras ~150 palabras');
    }

    if (R.imagen?.requerida) {
      const rel = d.image ? join(cfg.publicDir || 'public', d.image) : R.imagen.ruta.replace('{slug}', p.slug);
      const abs = join(ROOT, rel);
      if (!existsSync(abs)) errors.push(`falta la imagen ${rel}`);
      else if (R.imagen.maxKB && statSync(abs).size > R.imagen.maxKB * 1024)
        errors.push(`imagen de ${Math.round(statSync(abs).size / 1024)} KB (máx. ${R.imagen.maxKB})`);
    }
  }

  if (errors.length || warns.length) {
    const asErr = strict && errors.length;
    console.log(`${asErr ? '❌' : '⚠️ '} ${p.file}${vigente ? '' : '  (validación básica)'}`);
    for (const e of errors) console.log(`    ${strict ? 'error' : 'aviso'}: ${e}`);
    for (const w of warns) console.log(`    aviso: ${w}`);
    if (asErr) failed++;
    else warnedPosts++;
  } else if (strict) {
    console.log(`✅ ${p.file}${vigente ? '' : '  (validación básica)'}`);
  }
}

if (!cfg.enabled) console.log('\nℹ️  blog-agent está dormido (enabled: false): solo validación básica.');
if (!hasDist && distDir) console.log(`ℹ️  No existe ${cfg.build.dist}/: los enlaces internos no se comprobaron. Corre "${cfg.build.comando}" antes.`);
if (failed) {
  console.log(`\n${failed} post(s) no cumplen el checklist.`);
  process.exit(1);
}
console.log(audit ? `\nAuditoría: ${warnedPosts} post(s) con avisos de ${posts.length}.` : '\nTodo lo validado cumple el checklist.');
