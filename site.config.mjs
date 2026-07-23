// ============================================================
//  CONFIG POR CLIENTE — Ópticas Jarmar
// ============================================================

export const site = {
  // --- Identidad ---
  name: "Ópticas Jarmar",
  url: "https://www.jarmar.com", // sin slash final
  description:
    "Clínica Óptica Boutique con 60 años cuidando tu salud visual. Diagnóstico médico de precisión, lentes graduados, Jarmar Eyewear y lentes esclerales. Chiapas y Tijuana.",
  lang: "es-MX",

  // --- Organización (alimenta el schema y llms.txt) ---
  org: {
    legalName: "Ópticas Jarmar",
    type: "Optician",
    logo: "/logo-opticas-jarmar-blanco-esp.png",
    sameAs: [
      "https://www.facebook.com/opticasjarmarchiapas",
      "https://www.instagram.com/opticasjarmar/",
      "https://www.facebook.com/opticasjarmartijuana",
      "https://www.instagram.com/opticasjarmartijuana/",
    ],
  },

  // --- Autor por defecto de los posts ---
  defaultAuthor: "Equipo Ópticas Jarmar",

  // --- Marca (colores + fuentes reales de Jarmar) ---
  brand: {
    bg: "#071A3E",
    surface: "#0D2B6B",
    text: "#FFFFFF",
    muted: "#8899AA",
    accent: "#3A8FE0",
    accentText: "#FFFFFF",
    fontDisplay: "Playfair Display",
    fontBody: "DM Sans",
    fontMono: "DM Mono",
  },

  // --- GEO / voz de contenido para la IA ---
  content: {
    topic:
      "salud visual, óptica boutique, lentes graduados, lentes de contacto, lentes esclerales, examen de la vista, Jarmar Eyewear, optometría, contactología",
    audience:
      "personas que buscan lentes o revisión de la vista en Chiapas o Tijuana, sin conocimientos técnicos de optometría",
    guardrails: [
      "No dar diagnósticos médicos ni prometer resultados de salud.",
      "No inventar promociones, precios ni garantías específicas.",
      "Recomendar acudir a consulta presencial cuando aplique.",
    ],
  },
};
