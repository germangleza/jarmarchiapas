// Relación entre posts del blog y páginas de servicio por ciudad.
//
// Cada post declara en su frontmatter `ciudad` (tuxtla | tijuana | general) y
// `servicios` (slugs de ./servicios.ts). Con eso:
//   - el post enlaza a /<ciudad>/<servicio>/ (o a ambas ciudades si es general),
//   - cada página de servicio lista los posts de su ciudad sobre ese servicio,
//   - cada hub (/tuxtla/, /tijuana/) lista los posts de su ciudad.
import { getCollection, type CollectionEntry } from "astro:content";
import type { Ciudad, Servicio } from "./servicios";

type Post = CollectionEntry<"blog">;

const publicados = () =>
  getCollection("blog", ({ data }) => !data.draft).then((posts) =>
    posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  );

// Posts sobre un servicio. Con ciudad: primero los de esa ciudad y luego los
// generales. Sin ciudad (páginas genéricas): todos, del más reciente al más viejo.
export async function postsDeServicio(servicio: Servicio, ciudad?: Ciudad) {
  const posts = (await publicados()).filter((p) => p.data.servicios.includes(servicio));
  if (!ciudad) return posts;
  const locales = posts.filter((p) => p.data.ciudad === ciudad);
  const generales = posts.filter((p) => p.data.ciudad === "general");
  return [...locales, ...generales];
}

// Posts de una ciudad, del más reciente al más viejo (para los hubs).
export async function postsDeCiudad(ciudad: Ciudad) {
  return (await publicados()).filter((p) => p.data.ciudad === ciudad);
}

// Posts relacionados con otro post: comparten servicio y ciudad compatible.
// Se ordenan por servicios en común, luego misma ciudad, luego fecha.
export async function postsRelacionados(post: Post, limite = 3) {
  const { ciudad, servicios } = post.data;
  const compatible = (p: Post) =>
    ciudad === "general" || p.data.ciudad === "general" || p.data.ciudad === ciudad;
  return (await publicados())
    .filter((p) => p.id !== post.id && compatible(p))
    .map((p) => ({
      p,
      comunes: p.data.servicios.filter((s) => servicios.includes(s)).length,
      mismaCiudad: p.data.ciudad === ciudad ? 1 : 0,
    }))
    .filter((x) => x.comunes > 0)
    .sort((a, b) => b.comunes - a.comunes || b.mismaCiudad - a.mismaCiudad)
    .slice(0, limite)
    .map((x) => x.p);
}
