// Campos del pre-registro al Programa de Aceleración (los datos básicos ya
// capturados al inicio no se vuelven a pedir).

export const preregistroQuestions = [
  {
    id: "program_interest",
    texto: "¿Te interesaría participar en la próxima generación?",
    opciones: ["Sí, quiero recibir información", "Tal vez, quiero conocer más", "No por ahora"],
  },
  {
    id: "program_goal",
    texto: "¿Cuál sería tu principal objetivo al entrar al programa?",
    opciones: [
      "Mejorar rentabilidad",
      "Tener mayor control del negocio",
      "Diferenciar mi óptica",
      "Generar más pacientes",
      "Mejorar ventas",
      "Digitalizar la operación",
      "Mejorar el equipo",
      "Prepararme para crecer",
      "Otro",
    ],
  },
  {
    id: "contact_preference",
    texto: "¿Cómo preferirías que te contactemos?",
    opciones: ["WhatsApp", "Teléfono", "Correo"],
  },
];

export const preregistroComment = {
  id: "comment",
  texto: "¿Hay algo particular que quieras mejorar en tu óptica?",
};
