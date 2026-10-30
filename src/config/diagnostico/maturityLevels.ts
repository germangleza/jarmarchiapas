// Niveles de madurez por score global. `min` es inclusivo; se toma el nivel
// con el `min` más alto que el score alcance. El nivel superior (Óptica
// profesionalizada) empieza en `professionalTarget`: es la meta que muestra la
// escala del resultado ("a la tuya le faltan X puntos").

export interface MaturityLevel {
  id: string;
  min: number;
  max: number;
  nombre: string;
  texto: string;
}

export const professionalTarget = 80;

export const maturityLevels: MaturityLevel[] = [
  {
    id: "reactiva",
    min: 0,
    max: 39,
    nombre: "Óptica reactiva",
    texto: "Gran parte del negocio depende del día a día y del conocimiento de personas específicas.",
  },
  {
    id: "en_desarrollo",
    min: 40,
    max: 59,
    nombre: "Óptica en desarrollo",
    texto: "Ya existen algunas prácticas y procesos, pero todavía son inconsistentes o poco medidos.",
  },
  {
    id: "en_consolidacion",
    min: 60,
    max: 79,
    nombre: "Óptica en consolidación",
    texto: "La empresa cuenta con una base sólida en varias áreas, aunque todavía existen cuellos de botella que limitan crecimiento, rentabilidad o diferenciación.",
  },
  {
    id: "profesionalizada",
    min: 80,
    max: 100,
    nombre: "Óptica profesionalizada",
    texto: "Existen procesos, información y estructura. El siguiente reto es optimizar, diferenciar y escalar.",
  },
];
