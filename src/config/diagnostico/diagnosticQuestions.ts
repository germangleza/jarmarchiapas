// Banco de preguntas evaluativas (escala 1–5). Para agregar o quitar una
// pregunta basta con editar este arreglo: el flujo, la barra de progreso y el
// scoring se ajustan solos. No reutilizar un `id` borrado para otra pregunta.
// `opcional: true` muestra el botón "Omitir"; si se omite, la pregunta no
// cuenta ni en los puntos obtenidos ni en los máximos de su dimensión.

import type { DimensionId } from "./dimensions";

export interface DiagnosticQuestion {
  id: string;
  dimension: DimensionId;
  texto: string;
  opcional?: boolean;
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  // 1 — Control del negocio y números
  { id: "N1", dimension: "financial_control", texto: "Tengo claridad sobre las ventas, gastos, utilidad y flujo de efectivo de la óptica." },
  { id: "N2", dimension: "financial_control", texto: "Conozco el margen real de las principales categorías de productos y servicios que vendo." },
  { id: "N3", dimension: "financial_control", texto: "Reviso periódicamente indicadores clave como ticket promedio, margen, conversión y ventas por categoría." },
  { id: "N4", dimension: "financial_control", texto: "Puedo identificar cuáles productos, servicios o categorías generan mayor rentabilidad." },

  // 2 — Posicionamiento y diferenciación clínica
  { id: "D1", dimension: "differentiation", texto: "Nuestra óptica tiene una propuesta de valor clara que explica por qué un paciente debería elegirnos." },
  { id: "D2", dimension: "differentiation", texto: "Nuestro equipo puede explicar de forma consistente qué nos diferencia de otras ópticas." },
  { id: "D3", dimension: "differentiation", texto: "Contamos con servicios, protocolos o capacidades clínicas que fortalecen nuestra diferenciación." },
  { id: "D4", dimension: "differentiation", texto: "Nuestra propuesta de valor va más allá del precio, las promociones o las marcas que manejamos." },

  // 3 — Producto, precios e inventario
  { id: "P1", dimension: "product_inventory", texto: "Tenemos criterios claros para decidir qué productos comprar, cuánto comprar y cuándo reponer." },
  { id: "P2", dimension: "product_inventory", texto: "Conocemos la rotación y antigüedad de nuestro inventario." },
  { id: "P3", dimension: "product_inventory", texto: "Nuestros precios están definidos con base en costos, márgenes objetivo y estrategia comercial." },
  { id: "P4", dimension: "product_inventory", texto: "Contamos con estrategias estructuradas para aumentar el ticket promedio mediante segundo par, tratamientos, solares u otras soluciones complementarias." },

  // 4 — Venta y experiencia del paciente
  { id: "V1", dimension: "sales_experience", texto: "Existe un proceso de atención definido desde que el paciente llega hasta la entrega y postventa." },
  { id: "V2", dimension: "sales_experience", texto: "El equipo sigue un proceso comercial consistente para recomendar soluciones y cerrar ventas." },
  { id: "V3", dimension: "sales_experience", texto: "Medimos qué porcentaje de pacientes, consultas o cotizaciones terminan en compra." },
  { id: "V4", dimension: "sales_experience", texto: "Tenemos un sistema de seguimiento para pacientes que cotizaron, no compraron o requieren volver." },

  // 5 — Operación y digitalización
  { id: "O1", dimension: "digital_operations", texto: "El expediente e historial clínico de nuestros pacientes está digitalizado y es fácil de consultar." },
  { id: "O2", dimension: "digital_operations", texto: "Agenda, historial clínico, ventas e inventario están integrados o pueden consultarse de manera sencilla." },
  { id: "O3", dimension: "digital_operations", texto: "Podemos conocer ventas, inventarios y desempeño sin depender de archivos dispersos o de preguntarle a una persona." },
  { id: "O4", dimension: "digital_operations", texto: "Tenemos procesos operativos documentados para las actividades más importantes de la óptica." },

  // 6 — Presencia digital y adquisición de pacientes
  { id: "M1", dimension: "patient_acquisition", texto: "Cuando alguien busca nuestra óptica en Google encuentra información actualizada, buenas reseñas y una forma sencilla de contactarnos." },
  { id: "M2", dimension: "patient_acquisition", texto: "Nuestra página web y redes sociales comunican claramente qué hacemos, qué nos diferencia y cómo agendar." },
  { id: "M3", dimension: "patient_acquisition", texto: "Sabemos aproximadamente cuántos pacientes nuevos llegan cada mes y de qué canal provienen." },
  { id: "M4", dimension: "patient_acquisition", texto: "Tenemos acciones o campañas medibles para generar nuevos pacientes de manera constante." },
  { id: "M5", dimension: "patient_acquisition", texto: "Si mañana disminuyeran significativamente las recomendaciones de boca en boca, contamos con un sistema capaz de generar nuevos pacientes.", opcional: true },

  // 7 — Equipo, liderazgo y crecimiento
  { id: "L1", dimension: "team_leadership", texto: "Cada integrante del equipo tiene funciones, responsabilidades y expectativas claras." },
  { id: "L2", dimension: "team_leadership", texto: "Existen metas e indicadores para evaluar el desempeño del equipo." },
  { id: "L3", dimension: "team_leadership", texto: "La óptica puede operar correctamente aunque el dueño o director no esté presente." },
  { id: "L4", dimension: "team_leadership", texto: "Tenemos prioridades y objetivos definidos para el crecimiento de los próximos 12 meses." },
];

// Escala de madurez 1–5: `corto` va en los botones y como título en la ayuda,
// `texto` es la explicación breve de la ayuda.
export const scale = [
  { valor: 1, corto: "No existe", texto: "No lo tenemos." },
  { valor: 2, corto: "Informal", texto: "Se hace a veces o depende de una persona." },
  { valor: 3, corto: "Parcial", texto: "Existe, pero no es constante ni se mide." },
  { valor: 4, corto: "Implementado", texto: "Proceso definido que el equipo usa siempre." },
  { valor: 5, corto: "Medido y optimizado", texto: "Lo medimos y lo mejoramos con datos." },
];
