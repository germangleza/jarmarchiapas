import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SERVICIO_SLUGS } from "./lib/servicios";

// Colección de blog. Cada .md en src/content/blog es un post.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(), // resumen para meta + AI snippet
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    image: z.string().optional(),
    // Motor blog-agent (SEO/GEO). Opcionales para no romper posts viejos;
    // el validador (blog-agent/check-blog.mjs) los exige en posts nuevos.
    keyword: z.string().optional(), // keyword principal, única en el blog
    tldr: z.string().optional(), // respuesta de 40–60 palabras (arriba del post + llms.txt)
    sources: z
      .array(z.object({ title: z.string(), url: z.string().url() }))
      .default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Obligatorios: relacionan el post con las páginas de servicio de su
    // ciudad (ver src/lib/blog-relaciones.ts). "general" = ambas ciudades.
    ciudad: z.enum(["tuxtla", "tijuana", "general"]),
    servicios: z.array(z.enum(SERVICIO_SLUGS)),
  }),
});

export const collections = { blog };
