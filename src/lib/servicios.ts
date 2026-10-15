// Ciudades y servicios que pueden relacionarse con un post del blog.
// Vive aparte de blog-relaciones.ts porque content.config.ts lo importa
// para validar el frontmatter (y ese archivo no puede usar astro:content).
// Para agregar un servicio nuevo: crear /tuxtla/<slug> y /tijuana/<slug> y
// sumarlo a SERVICIOS.

export const CIUDADES = {
  tuxtla: { nombre: "Tuxtla Gutiérrez", region: "Chiapas", hub: "/tuxtla/" },
  tijuana: { nombre: "Tijuana", region: "Zona Río", hub: "/tijuana/" },
} as const;

export type Ciudad = keyof typeof CIUDADES;

export const SERVICIOS = {
  "estudio-de-la-vista": "Examen de la vista",
  "examen-ninos": "Examen de la vista para niños",
  "lentes-graduados": "Lentes graduados",
  "lentes-de-contacto": "Lentes de contacto",
  "lentes-de-sol": "Lentes de sol",
  "lentes-luz-azul": "Lentes con filtro de luz azul",
  "lentes-esclerales": "Lentes esclerales",
  queratocono: "Queratocono",
} as const;

export type Servicio = keyof typeof SERVICIOS;

export const SERVICIO_SLUGS = Object.keys(SERVICIOS) as [Servicio, ...Servicio[]];

export const servicioUrl = (servicio: Servicio, ciudad: Ciudad) =>
  `/${ciudad}/${servicio}/`;
