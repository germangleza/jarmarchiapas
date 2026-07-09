#!/usr/bin/env node
// ============================================================
//  GENERADOR DE BLOGS CON IA — Maguey Studio
// ============================================================
//  Uso:
//    ANTHROPIC_API_KEY=sk-... npm run blog -- "tema del artículo"
//
//  Flags:
//    --publish        publica directo (draft:false). Sin esto, queda
//                     como borrador para que lo revises antes.
//    --model <id>     modelo a usar (default: claude-sonnet-5)
//
//  El artículo se escribe en src/content/blog/<slug>.md ya con
//  frontmatter, estructura GEO y los guardrails del cliente aplicados.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../site.config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, "..", "src", "content", "blog");

// --- args ---
const args = process.argv.slice(2);
const publish = args.includes("--publish");
const modelIdx = args.indexOf("--model");
const model = modelIdx !== -1 ? args[modelIdx + 1] : "claude-sonnet-5";
const topic = args
  .filter((a, i) => !a.startsWith("--") && (modelIdx === -1 || i !== modelIdx + 1))
  .join(" ")
  .trim();

if (!topic) {
  console.error('❌ Falta el tema. Ej: npm run blog -- "mitos sobre la vista"');
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ Falta ANTHROPIC_API_KEY en el entorno.");
  process.exit(1);
}

// --- prompt de sistema: aquí vive tu ventaja GEO ---
// 👉 Pega tu Master GEO Prompt en la sección marcada para
//    reemplazar/complementar estas instrucciones base.
const systemPrompt = `Eres redactor de contenidos para "${site.org.legalName}" (${site.org.type}).
Escribes artículos de blog en español optimizados para GEO (Generative Engine Optimization):
contenido que ChatGPT, Gemini y Perplexity puedan citar como fuente.

Negocio: ${site.content.topic}
Audiencia: ${site.content.audience}

=== PRINCIPIOS GEO (obligatorios) ===
- Responde la pregunta central de forma directa en el primer párrafo (fragmento citable).
- Usa encabezados H2/H3 claros que sean preguntas o afirmaciones concretas.
- Frases autónomas: cada afirmación clave debe entenderse fuera de contexto.
- Datos y pasos concretos > relleno. Nada de introducciones vacías.
- Consistencia de entidad: menciona el negocio de forma natural, sin spam.
- Tono claro, humano, sin jerga innecesaria.

=== GUARDRAILS DEL CLIENTE (nunca violar) ===
${site.content.guardrails.map((g) => `- ${g}`).join("\n")}

=== TU MASTER GEO PROMPT ===
(Pega aquí tus reglas específicas de Maguey Studio si quieres reforzar.)

=== FORMATO DE SALIDA ===
Devuelve SOLO un objeto JSON válido, sin texto extra ni backticks, con esta forma:
{
  "title": "título atractivo, < 65 caracteres",
  "description": "resumen de 1 frase para meta y snippet de IA, < 155 caracteres",
  "slug": "slug-en-minusculas-con-guiones",
  "tags": ["3", "a", "5", "tags"],
  "body_markdown": "cuerpo del artículo en Markdown, empezando en H2 (no repitas el título como H1)"
}`;

const userPrompt = `Escribe un artículo de blog sobre: "${topic}"`;

console.log(`\n🌿 Generando artículo con ${model}...`);
console.log(`   Tema: ${topic}\n`);

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  }),
});

if (!res.ok) {
  console.error("❌ Error de la API:", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
const raw = data.content
  .filter((b) => b.type === "text")
  .map((b) => b.text)
  .join("")
  .trim();

let post;
try {
  const clean = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  post = JSON.parse(clean);
} catch (e) {
  console.error("❌ No pude parsear el JSON. Respuesta cruda:\n", raw);
  process.exit(1);
}

// --- construir el archivo .md ---
const slug =
  (post.slug || topic)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "post";

const today = new Date().toISOString().split("T")[0];
const tags = Array.isArray(post.tags) ? post.tags : [];

const frontmatter = `---
title: ${JSON.stringify(post.title)}
description: ${JSON.stringify(post.description)}
pubDate: ${today}
author: ${JSON.stringify(site.defaultAuthor)}
tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]
draft: ${publish ? "false" : "true"}
---

`;

const filePath = path.join(BLOG_DIR, `${slug}.md`);
fs.writeFileSync(filePath, frontmatter + post.body_markdown.trim() + "\n");

console.log(`✅ Artículo creado: src/content/blog/${slug}.md`);
console.log(`   Título: ${post.title}`);
console.log(
  publish
    ? "   Estado: PUBLICADO (se verá al hacer deploy)"
    : "   Estado: BORRADOR — revísalo y quita draft:true (o corre con --publish)"
);
console.log("\n   Siguiente paso: git add / commit / push → Vercel redeploya solo.\n");
