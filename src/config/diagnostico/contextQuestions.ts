// Preguntas de contexto: segmentan el lead y NO suman puntos.
// `id` es la columna que se guarda (ctx_<id>); el texto de la opción elegida
// es lo que se guarda como valor. Con `multiple: true` se pueden elegir varias
// y se guardan juntas separadas por " | ".

export interface ContextQuestion {
  id: string;
  texto: string;
  opciones: string[];
  multiple?: boolean;
}

export const contextQuestions: ContextQuestion[] = [
  {
    id: "years_operating",
    texto: "¿Cuántos años lleva operando tu óptica?",
    opciones: ["Menos de 2 años", "2–5 años", "6–10 años", "11–20 años", "Más de 20 años"],
  },
  {
    id: "branches",
    texto: "¿Cuántas sucursales tienes actualmente?",
    opciones: ["1", "2", "3–5", "6–10", "Más de 10"],
  },
  {
    id: "team_size",
    texto: "¿Cuántas personas trabajan actualmente en el negocio?",
    opciones: ["1–3", "4–7", "8–15", "16–30", "Más de 30"],
  },
  {
    id: "role",
    texto: "¿Cuál describe mejor tu rol?",
    opciones: ["Dueño / fundador", "Optometrista propietario", "Director general", "Administrador / gerente", "Socio", "Otro"],
  },
  {
    id: "main_challenge",
    texto: "¿Cuáles son tus principales retos actualmente?",
    multiple: true,
    opciones: [
      "Aumentar ventas",
      "Mejorar rentabilidad",
      "Generar más pacientes",
      "Diferenciar mi óptica",
      "Mejorar operación",
      "Tener mayor control financiero",
      "Mejorar mi equipo",
      "Digitalizar el negocio",
      "Abrir nuevas sucursales",
      "Otro",
    ],
  },
];

// País: el primero es el valor por defecto. "Otro" deja escribirlo.
export const countries = [
  "México",
  "Estados Unidos",
  "Guatemala",
  "Colombia",
  "Perú",
  "Chile",
  "Argentina",
  "Ecuador",
  "Costa Rica",
  "Panamá",
  "República Dominicana",
  "España",
  "Otro",
];
