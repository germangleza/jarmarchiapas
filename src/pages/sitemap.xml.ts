import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../../site.config.mjs";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const staticPages = [
    { loc: `${site.url}/`, priority: "1.0" },
    { loc: `${site.url}/chiapas/`, priority: "0.9" },
    { loc: `${site.url}/tijuana/`, priority: "0.9" },
    // Chiapas — servicios
    { loc: `${site.url}/chiapas/estudio-de-la-vista`, priority: "0.8" },
    { loc: `${site.url}/chiapas/lentes-graduados`, priority: "0.8" },
    { loc: `${site.url}/chiapas/lentes-de-sol`, priority: "0.8" },
    { loc: `${site.url}/chiapas/lentes-luz-azul`, priority: "0.8" },
    { loc: `${site.url}/chiapas/lentes-esclerales`, priority: "0.8" },
    { loc: `${site.url}/chiapas/examen-ninos`, priority: "0.8" },
    // Tijuana — servicios
    { loc: `${site.url}/tijuana/estudio-de-la-vista`, priority: "0.8" },
    { loc: `${site.url}/tijuana/lentes-graduados`, priority: "0.8" },
    { loc: `${site.url}/tijuana/lentes-de-sol`, priority: "0.8" },
    { loc: `${site.url}/tijuana/lentes-luz-azul`, priority: "0.8" },
    { loc: `${site.url}/tijuana/lentes-esclerales`, priority: "0.8" },
    { loc: `${site.url}/tijuana/examen-ninos`, priority: "0.8" },
    // Tijuana EN — home + servicios
    { loc: `${site.url}/en/tijuana/`, priority: "0.8" },
    { loc: `${site.url}/en/tijuana/eye-exam`, priority: "0.7" },
    { loc: `${site.url}/en/tijuana/prescription-glasses`, priority: "0.7" },
    { loc: `${site.url}/en/tijuana/blue-light-lenses`, priority: "0.7" },
    { loc: `${site.url}/en/tijuana/sunglasses`, priority: "0.7" },
    { loc: `${site.url}/en/tijuana/scleral-lenses`, priority: "0.7" },
    { loc: `${site.url}/en/tijuana/childrens-eye-exam`, priority: "0.7" },
    // Optometristas
    { loc: `${site.url}/jorgearanda/`, priority: "0.6" },
    { loc: `${site.url}/aaronlinares/`, priority: "0.6" },
    { loc: `${site.url}/hectorpineda/`, priority: "0.6" },
    { loc: `${site.url}/blog/`, priority: "0.8" },
  ];

  const blogUrls = posts.map((p) => ({
    loc: `${site.url}/blog/${p.id}/`,
    priority: "0.7",
    lastmod: (p.data.updatedDate ?? p.data.pubDate).toISOString().split("T")[0],
  }));

  const today = new Date().toISOString().split("T")[0];

  const allUrls = [
    ...staticPages.map((u) => ({ ...u, lastmod: today })),
    ...blogUrls,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
};
