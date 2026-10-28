// Textos de la pantalla de resultados que dependen de las dimensiones.

import type { DimensionId } from "./dimensions";

/** Texto de la principal fortaleza (igual para cualquier dimensión en V1). */
export const strengthMessage =
  "Ya cuentas con una base sólida en esta área. El siguiente paso es asegurarte de que esta fortaleza pueda sostenerse y escalar a medida que crece el negocio.";

/** Texto del principal cuello de botella (la dimensión con menor score). */
export const bottleneckMessages: Record<DimensionId, string> = {
  financial_control:
    "Tu principal oportunidad está en el control del negocio. Sin claridad sobre márgenes, indicadores y rentabilidad, es difícil tomar decisiones de compra, precios y crecimiento con seguridad.",
  differentiation:
    "Tu óptica tiene oportunidad de construir una propuesta más clara y diferenciada. Competir principalmente por precio, promoción o marcas puede limitar margen y fidelidad.",
  product_inventory:
    "Existe una oportunidad importante para mejorar compras, rotación, precios e inventario. Una mejor gestión de producto puede liberar flujo y aumentar rentabilidad.",
  sales_experience:
    "Puedes estar perdiendo oportunidades dentro de tu propia óptica. Estandarizar atención, seguimiento y proceso comercial puede mejorar conversión y ticket promedio.",
  digital_operations:
    "La operación depende demasiado de procesos manuales o información dispersa. Digitalizar y conectar información puede mejorar control, servicio y productividad.",
  patient_acquisition:
    "Hoy la generación de pacientes puede depender demasiado de recomendaciones o acciones poco medibles. Construir un sistema predecible de adquisición puede acelerar el crecimiento.",
  team_leadership:
    "El negocio puede estar dependiendo demasiado del dueño o de personas específicas. Definir responsabilidades, indicadores y procesos es clave para crecer sin perder control.",
};
