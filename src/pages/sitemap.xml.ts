import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../../site.config.mjs";

// Converts a glob-relative path like ./tijuana/lentes-esclerales.astro → /tijuana/lentes-esclerales/
function pathToUrl(filePath: string): string {
  return filePath
    .replace(/^\.\//, "/")
    .replace(/\/index\.astro$/, "/")
    .replace(/\.astro$/, "/");
}

// Assigns SEO priority based on URL depth and section
function getPriority(url: string): string {
  if (url === "/") return "1.0";
  if (/^\/(chiapas|tijuana)\/$/.test(url)) return "0.9";
  if (url === "/blog/") return "0.8";
  if (/^\/en\/tijuana\/$/.test(url)) return "0.8";
  if (/^\/(chiapas|tijuana)\//.test(url)) return "0.8";
  if (/^\/en\/tijuana\//.test(url)) return "0.7";
  if (/^\/(jorgearanda|aaronlinares|hectorpineda)\//.test(url)) return "0.6";
  return "0.7";
}

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  // Auto-discovers all static .astro pages — no manual list to maintain
  const pageFiles = import.meta.glob("./**/*.astro");
  const skip = /\[|404/; // exclude dynamic routes and 404

  const today = new Date().toISOString().split("T")[0];

  const staticUrls = Object.keys(pageFiles)
    .filter((p) => !skip.test(p))
    .map((p) => {
      const url = pathToUrl(p);
      return {
        loc: `${site.url}${url}`,
        priority: getPriority(url),
        lastmod: today,
      };
    })
    .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

  const blogUrls = posts.map((p) => ({
    loc: `${site.url}/blog/${p.id}/`,
    priority: "0.7",
    lastmod: (p.data.updatedDate ?? p.data.pubDate).toISOString().split("T")[0],
  }));

  const allUrls = [...staticUrls, ...blogUrls];

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
