// Genera la portada de un post: recorta una foto a 16:9 (1600×900) y la guarda
// en public/blog/<slug>.jpg con menos de 300 KB.
// Uso: node seo-agent/portada.mjs <ruta-foto> <slug> [encuadre]
//   encuadre: attention (default, busca la zona más interesante) | entropy |
//             centre | north | south | east | west
import { createRequire } from "module";
import fs from "fs";

const sharp = createRequire(import.meta.url)("sharp");
const [foto, slug, encuadre = "attention"] = process.argv.slice(2);
if (!foto || !slug) {
  console.error("Uso: node seo-agent/portada.mjs <ruta-foto> <slug> [encuadre]");
  process.exit(1);
}
const salida = `public/blog/${slug}.jpg`;
const position = ["attention", "entropy"].includes(encuadre) ? sharp.strategy[encuadre] : encuadre;

for (const quality of [82, 75, 68, 60]) {
  const buf = await sharp(foto)
    .rotate()
    .resize(1600, 900, { fit: "cover", position })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  if (buf.length < 300 * 1024 || quality === 60) {
    fs.writeFileSync(salida, buf);
    console.log(`${salida} · ${Math.round(buf.length / 1024)} KB · q${quality}`);
    break;
  }
}
