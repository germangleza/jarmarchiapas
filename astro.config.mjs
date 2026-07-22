import { defineConfig } from "astro/config";
import { site } from "./site.config.mjs";

export default defineConfig({
  site: site.url,
  build: {
    // CSS embebido en el HTML: evita páginas sin estilos cuando el navegador
    // tiene HTML cacheado que referencia un asset con hash de un deploy anterior.
    inlineStylesheets: "always",
  },
});
