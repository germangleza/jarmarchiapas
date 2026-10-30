// Textos de la pantalla de resultados que dependen de las dimensiones.

import type { DimensionId } from "./dimensions";

/** Texto de la principal fortaleza (solo se muestra si llega a strengthMin). */
export const strengthMessage =
  "Ya cuentas con una base sólida en esta área. El siguiente paso es asegurarte de que esta fortaleza pueda sostenerse y escalar a medida que crece el negocio.";

/** Cuando ninguna dimensión llega a strengthMin. */
export const noStrengthMessage = {
  titulo: "Aún no tienes un área consolidada.",
  texto: "Ninguna dimensión supera 70/100 todavía. Es normal en ópticas que han crecido sin sistemas, y es justo lo que se puede construir.",
};

/** Escala de madurez del resultado. {faltan} se reemplaza por los puntos. */
export const targetMessages = {
  faltan: "Una óptica profesionalizada está en <strong>80+</strong>. A la tuya le faltan <strong>{faltan} puntos</strong>.",
  logrado: "Tu óptica ya está en nivel profesionalizado. El siguiente reto es sostenerlo y escalarlo.",
};

/** Principal cuello de botella: solo QUÉ pasa y por qué importa. El CÓMO
 *  resolverlo se trabaja en la lectura del diagnóstico, no va aquí. */
export const bottleneckMessages: Record<DimensionId, string> = {
  financial_control:
    "Hoy no tienes plena claridad sobre márgenes, indicadores y rentabilidad. Sin esa información, las decisiones de compra, precios y crecimiento se toman con poca seguridad.",
  differentiation:
    "Tu óptica todavía no tiene una propuesta clara que la distinga. Cuando se compite principalmente por precio, promoción o marcas, el margen y la fidelidad de los pacientes se reducen.",
  product_inventory:
    "Las compras, la rotación, los precios y el inventario no se manejan con criterios claros. Eso suele dejar dinero detenido en vitrina y margen sobre la mesa.",
  sales_experience:
    "La atención y el proceso comercial dependen de cada persona y no hay un seguimiento constante. Es probable que estés perdiendo ventas con pacientes que ya entraron a tu óptica.",
  digital_operations:
    "La operación depende demasiado de procesos manuales o información dispersa. Eso limita el control, la calidad del servicio y la productividad del equipo.",
  patient_acquisition:
    "La llegada de pacientes nuevos depende de recomendaciones o de acciones que no se miden. Sin un sistema predecible, el crecimiento queda sujeto a la suerte.",
  team_leadership:
    "El negocio depende demasiado del dueño o de personas específicas. Sin responsabilidades e indicadores claros, crecer significa perder control.",
};

/** Reto declarado en el contexto → dimensión relacionada. Los retos que no
 *  aparecen aquí (Abrir nuevas sucursales, Otro) no muestran la conexión. */
export const challengeToDimension: Record<string, DimensionId> = {
  "Aumentar ventas": "sales_experience",
  "Mejorar rentabilidad": "financial_control",
  "Generar más pacientes": "patient_acquisition",
  "Diferenciar mi óptica": "differentiation",
  "Mejorar operación": "digital_operations",
  "Tener mayor control financiero": "financial_control",
  "Mejorar mi equipo": "team_leadership",
  "Digitalizar el negocio": "digital_operations",
};

/** {reto}, {dimension} y {puntaje} se reemplazan. */
export const challengeLine = "Dijiste que uno de tus retos es <strong>{reto}</strong>. Tu puntaje en <strong>{dimension}</strong> es <strong>{puntaje}/100</strong>.";
