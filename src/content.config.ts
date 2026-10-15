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
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Obligatorios: relacionan el post con las páginas de servicio de su
    // ciudad (ver src/lib/blog-relaciones.ts). "general" = ambas ciudades.
    ciudad: z.enum(["tuxtla", "tijuana", "general"]),
    servicios: z.array(z.enum(SERVICIO_SLUGS)),
  }),
});

export const collections = { blog };
