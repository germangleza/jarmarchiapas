// Recomendaciones de la pantalla de resultados: se muestra una por cada una de
// las 3 dimensiones con menor score. Orientan el siguiente paso; no pretenden
// resolver el problema ni revelar módulos del programa.
// BORRADOR: estos textos no venían en la especificación; validar antes de
// usarlos en campañas.

import type { DimensionId } from "./dimensions";

export const recommendations: Record<DimensionId, { titulo: string; texto: string }> = {
  financial_control: {
    titulo: "Empieza por un tablero mensual sencillo",
    texto: "Define 4 o 5 números que revisarás cada mes —ventas, margen, ticket promedio y gastos— y anótalos siempre en el mismo lugar. Tener la serie completa vale más que tener el dato perfecto.",
  },
  differentiation: {
    titulo: "Escribe por qué un paciente debería elegirte",
    texto: "Pon en una frase lo que haces distinto y que no dependa del precio ni de las marcas. Después revisa si todo tu equipo la explica igual.",
  },
  product_inventory: {
    titulo: "Revisa qué tienes detenido en vitrina",
    texto: "Identifica los armazones y productos con más tiempo sin venderse. Saber qué no rota es el primer paso para comprar mejor y liberar flujo.",
  },
  sales_experience: {
    titulo: "Mide cuántos pacientes terminan comprando",
    texto: "Durante un mes registra cuántos exámenes o cotizaciones terminan en venta. Ese dato te dirá si el reto está en atraer pacientes o en convertirlos.",
  },
  digital_operations: {
    titulo: "Concentra la información en un solo lugar",
    texto: "Haz una lista de dónde vive hoy la información clave —expedientes, ventas, inventario, agenda— y elige cuál digitalizar primero.",
  },
  patient_acquisition: {
    titulo: "Pregunta a cada paciente nuevo cómo te encontró",
    texto: "Registra el canal de cada paciente nuevo durante un mes y mantén tu perfil de Google actualizado. Así sabrás qué funciona antes de invertir más.",
  },
  team_leadership: {
    titulo: "Pon por escrito quién es responsable de qué",
    texto: "Define las funciones y una meta clara por puesto. Es el punto de partida para que la óptica funcione bien aunque tú no estés.",
  },
};
