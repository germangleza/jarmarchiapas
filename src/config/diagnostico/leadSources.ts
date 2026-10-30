// Fuentes de leads. Cada QR, liga o campaña debe llevar ?utm_source=<id>
// (y opcionalmente utm_medium / utm_campaign). Ejemplo para un QR del
// congreso de Franja:
//   https://www.jarmar.com/diagnostico360/?utm_source=franja&utm_medium=qr&utm_campaign=franja-2026
// Si utm_source no está en esta lista se guarda tal cual; si no hay UTM se
// deduce del referrer (instagram, linkedin, google…) o queda como "directo".

export const leadSources: Record<string, string> = {
  conferencia: "Conferencia",
  congreso: "Congreso",
  franja: "Franja",
  "2020": "20/20",
  colegio: "Colegio",
  asociacion: "Asociación",
  shamir: "Shamir",
  proveedor: "Proveedor",
  alumni: "Alumni",
  referido: "Referido",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  web: "Web",
  qr: "QR",
};

/** Dominios del referrer → fuente, cuando no hay utm_source. */
export const referrerSources: Record<string, string> = {
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
  "wa.me": "whatsapp",
  "whatsapp.com": "whatsapp",
  "google.": "google",
  "bing.com": "bing",
  "jarmar.com": "web",
};

// Etapas del lead. El sitio solo asigna las tres primeras; el resto las
// actualiza el equipo comercial en la exportación / CRM.
export const leadStages = [
  "diagnostico_iniciado",
  "diagnostico_completado",
  "pre_registro",
  "contactado",
  "entrevista_agendada",
  "entrevista_realizada",
  "invitado_programa",
  "inscrito",
  "no_interesado",
  "seguimiento_futuro",
] as const;
