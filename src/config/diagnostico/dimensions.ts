// Dimensiones del Diagnóstico 360. El orden de este arreglo es el orden en que
// se preguntan y se muestran. `id` es la clave que se guarda en los leads: no
// cambiarla una vez publicado, o los datos viejos y nuevos dejan de cuadrar.
// `peso` existe para versiones futuras; en V1 todas pesan igual (1).

export type DimensionId =
  | "financial_control"
  | "differentiation"
  | "product_inventory"
  | "sales_experience"
  | "digital_operations"
  | "patient_acquisition"
  | "team_leadership";

export interface Dimension {
  id: DimensionId;
  /** Nombre completo: encabezado de cada bloque de preguntas. */
  nombre: string;
  /** Nombre corto: gráfica de resultados, fortaleza y prioridades. */
  corto: string;
  peso: number;
}

export const dimensions: Dimension[] = [
  { id: "financial_control", nombre: "Control del negocio y números", corto: "Control financiero", peso: 1 },
  { id: "differentiation", nombre: "Posicionamiento y diferenciación clínica", corto: "Diferenciación", peso: 1 },
  { id: "product_inventory", nombre: "Producto, precios e inventario", corto: "Producto e inventario", peso: 1 },
  { id: "sales_experience", nombre: "Venta y experiencia del paciente", corto: "Ventas y experiencia", peso: 1 },
  { id: "digital_operations", nombre: "Operación y digitalización", corto: "Digitalización", peso: 1 },
  { id: "patient_acquisition", nombre: "Presencia digital y adquisición de pacientes", corto: "Adquisición de pacientes", peso: 1 },
  { id: "team_leadership", nombre: "Equipo, liderazgo y crecimiento", corto: "Equipo y liderazgo", peso: 1 },
];
