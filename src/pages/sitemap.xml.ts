import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../../site.config.mjs";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const staticPages = [
    { loc: `${site.url}/`, priority: "1.0" },
    { loc: `${site.url}/chiapas/`, priority: "0.9" },
    { loc: `${site.url}/tijuana/`, priority: "0.9" },
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
