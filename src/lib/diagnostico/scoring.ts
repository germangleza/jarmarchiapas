// Scoring del Diagnóstico 360. Funciones puras: reciben la configuración y las
// respuestas y devuelven el resultado; no tocan el DOM ni el almacenamiento.
//
//   score_dimension = puntos_obtenidos / puntos_maximos * 100
//   score_global    = promedio ponderado de las dimensiones (en V1 peso 1)
//
// Las preguntas opcionales omitidas no cuentan en obtenidos ni en máximos.
//
// Oportunidades = las 3 dimensiones con menor puntaje (la #1 es el cuello de
// botella); los empates se ordenan con `tieBreak`. Fortaleza = la dimensión
// con mayor puntaje entre las que NO son oportunidad, y solo si llega a
// `strengthMin`; si ninguna llega, no hay fortaleza (null).

import type { Dimension, DimensionId } from "../../config/diagnostico/dimensions";
import type { DiagnosticQuestion } from "../../config/diagnostico/diagnosticQuestions";
import type { MaturityLevel } from "../../config/diagnostico/maturityLevels";

export const SCALE_MAX = 5;

/** question_id → valor 1–5. Una pregunta omitida no aparece. */
export type Answers = Record<string, number>;

export interface DiagnosticResult {
  global_score: number;
  maturity_level: string;
  maturity_level_id: string;
  dimensions: Record<DimensionId, number>;
  top_strength: DimensionId | null;
  priorities: DimensionId[];
}

export interface ScoringRules {
  tieBreak: DimensionId[];
  strengthMin: number;
}

export function scoreDimensions(
  dimensions: Dimension[],
  questions: DiagnosticQuestion[],
  answers: Answers,
): Record<DimensionId, number> {
  const out = {} as Record<DimensionId, number>;
  for (const d of dimensions) {
    let obtenidos = 0;
    let maximos = 0;
    for (const q of questions) {
      if (q.dimension !== d.id) continue;
      const v = answers[q.id];
      if (typeof v !== "number") continue;
      obtenidos += v;
      maximos += SCALE_MAX;
    }
    out[d.id] = maximos ? Math.round((obtenidos / maximos) * 100) : 0;
  }
  return out;
}

export function maturityFor(levels: MaturityLevel[], score: number): MaturityLevel {
  const ordenados = [...levels].sort((a, b) => a.min - b.min);
  let nivel = ordenados[0];
  for (const l of ordenados) if (score >= l.min) nivel = l;
  return nivel;
}

export function computeResult(
  dimensions: Dimension[],
  questions: DiagnosticQuestion[],
  levels: MaturityLevel[],
  answers: Answers,
  rules: ScoringRules,
): DiagnosticResult {
  const scores = scoreDimensions(dimensions, questions, answers);

  const pesoTotal = dimensions.reduce((s, d) => s + d.peso, 0);
  const global = Math.round(
    dimensions.reduce((s, d) => s + scores[d.id] * d.peso, 0) / (pesoTotal || 1),
  );
  const nivel = maturityFor(levels, global);

  // Dimensiones fuera de la lista de desempate van al final, en su orden.
  const rango = (id: DimensionId) => {
    const i = rules.tieBreak.indexOf(id);
    return i === -1 ? rules.tieBreak.length + dimensions.findIndex((d) => d.id === id) : i;
  };
  const priorities = dimensions
    .map((d) => d.id)
    .sort((a, b) => scores[a] - scores[b] || rango(a) - rango(b))
    .slice(0, 3);

  // Empate en la fortaleza: gana la que aparece primero en la configuración.
  let top_strength: DimensionId | null = null;
  for (const d of dimensions) {
    if (priorities.includes(d.id) || scores[d.id] < rules.strengthMin) continue;
    if (top_strength === null || scores[d.id] > scores[top_strength]) top_strength = d.id;
  }

  return {
    global_score: global,
    maturity_level: nivel.nombre,
    maturity_level_id: nivel.id,
    dimensions: scores,
    top_strength,
    priorities,
  };
}
