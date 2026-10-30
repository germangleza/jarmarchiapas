// Arma y envía el registro del lead. El sitio es estático, así que los
// registros van a Formspree (igual que /aceleracion), que los guarda y permite
// exportarlos a CSV. Se manda un objeto plano —una columna por dato— para que
// el CSV quede legible.
//
// Cada lead se envía hasta tres veces, una por etapa (diagnostico_iniciado,
// diagnostico_completado, pre_registro), siempre con el mismo lead_id; la fila
// más reciente de cada lead_id es la vigente. El estado local recuerda qué
// etapas ya se enviaron para no duplicar registros al refrescar.

import { contextQuestions, diagnosticQuestions, dimensions } from "../../config/diagnostico";
import type { DiagnosticResult } from "./scoring";
import type { Tracking } from "./tracking";

export type Etapa = "diagnostico_iniciado" | "diagnostico_completado" | "pre_registro";

export interface DatosBasicos {
  nombre: string;
  email: string;
  telefono: string;
  optica: string;
  ciudad: string;
  pais: string;
}

export interface LeadState {
  leadId: string;
  createdAt: string;
  datos: DatosBasicos;
  contexto: Record<string, string>;
  respuestas: Record<string, number>;
  preregistro: Record<string, string>;
  tracking: Tracking;
}

export function buildPayload(s: LeadState, etapa: Etapa, r: DiagnosticResult | null) {
  const p: Record<string, string | number> = {
    _subject: `Diagnóstico 360 · ${etapa.replace(/_/g, " ")} · ${s.datos.nombre}${s.datos.optica ? ` (${s.datos.optica})` : ""}`,
    formulario: "diagnostico-360",
    lead_id: s.leadId,
    created_at: s.createdAt,
    sent_at: new Date().toISOString(),
    sales_status: etapa,
    name: s.datos.nombre,
    email: s.datos.email,
    phone: s.datos.telefono,
    optical_name: s.datos.optica ?? "",
    city: s.datos.ciudad,
    country: s.datos.pais,
  };

  for (const c of contextQuestions) p[`ctx_${c.id}`] = s.contexto[c.id] ?? "";

  if (r) {
    p.global_score = r.global_score;
    p.maturity_level = r.maturity_level;
    for (const d of dimensions) p[`score_${d.id}`] = r.dimensions[d.id];
    p.top_strength = r.top_strength;
    p.priority_1 = r.priorities[0] ?? "";
    p.priority_2 = r.priorities[1] ?? "";
    p.priority_3 = r.priorities[2] ?? "";
    p.lowest_dimension = r.priorities[0] ?? "";
    for (const q of diagnosticQuestions) p[`q_${q.id}`] = s.respuestas[q.id] ?? "";
    // Respuestas completas en el formato acordado, por si se procesan después.
    p.answers_json = JSON.stringify(
      diagnosticQuestions
        .filter((q) => typeof s.respuestas[q.id] === "number")
        .map((q) => ({ question_id: q.id, dimension: q.dimension, value: s.respuestas[q.id] })),
    );
    p.result_json = JSON.stringify({
      global_score: r.global_score,
      maturity_level: r.maturity_level,
      dimensions: r.dimensions,
      top_strength: r.top_strength,
      priorities: r.priorities,
    });
  }

  if (etapa === "pre_registro") {
    p.program_interest = s.preregistro.program_interest ?? "";
    p.program_goal = s.preregistro.program_goal ?? "";
    p.contact_preference = s.preregistro.contact_preference ?? "";
    p.comment = s.preregistro.comment ?? "";
  }

  const t = s.tracking;
  p.source = t.source;
  p.source_label = t.source_label;
  p.medium = t.medium;
  p.utm_campaign = t.campaign;
  p.utm_term = t.utm_term;
  p.utm_content = t.utm_content;
  p.referrer = t.referrer;
  p.landing_url = t.landing_url;

  return p;
}

export async function sendLead(endpoint: string, payload: Record<string, string | number>): Promise<void> {
  if (!endpoint) throw new Error("Sin endpoint configurado");
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
  if (!r.ok) {
    const cuerpo = await r.text().catch(() => "");
    console.error("[diagnostico] El servicio rechazó el envío. HTTP " + r.status, cuerpo);
    throw new Error("HTTP " + r.status);
  }
}
