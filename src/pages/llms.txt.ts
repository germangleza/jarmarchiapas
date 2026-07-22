import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../../site.config.mjs";

export const GET: APIRoute = async () => {
  const posts = (
    await getCollection("blog", ({ data }) => !data.draft)
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const body = `# ${site.org.legalName}

> ${site.description}

## Páginas principales

- [Inicio](${site.url}/): Hub nacional de Ópticas Jarmar — Clínica Óptica Boutique con presencia en Chiapas y Tijuana.
- [Chiapas — Tuxtla Gutiérrez](${site.url}/chiapas/): Sucursales Plaza Cedros y Plaza Crystal. Diagnóstico médico, lentes graduados, Jarmar Eyewear, lentes esclerales.
- [Tijuana — Baja California](${site.url}/tijuana/): Sucursal Zona Urbana Río. Clínica Óptica Boutique de referencia en Tijuana.
- [Nuestra Historia](${site.url}/historia/): 60 años de historia, de Tuxtla Gutiérrez (1966) a Tijuana. Tres generaciones cuidando la visión de México.

## Optometristas

- [Opt. Jorge Aranda Tello](${site.url}/jorgearanda/): Optometría y Contactología Especializada. Sucursales Chiapas y Tijuana.
- [Opt. Aarón Linares](${site.url}/aaronlinares/): Optometría y Contactología Especializada. Sucursal Tijuana.
- [Opt. Héctor Pineda](${site.url}/hectorpineda/): Optometría y Contactología Especializada. Sucursales Chiapas.

## Blog
${posts
  .map(
    (p) =>
      `- [${p.data.title}](${site.url}/blog/${p.id}/): ${p.data.description}`
  )
  .join("\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
