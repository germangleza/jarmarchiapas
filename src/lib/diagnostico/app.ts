// Flujo interactivo del Diagnóstico 360 (/diagnostico360).
//
// Pantallas: hero → datos → contexto (una por pregunta) → escala → preguntas
// (una por pantalla) → calculando → resultado. El resultado dice QUÉ le pasa a
// la óptica; el CÓMO (plan, revisión de respuestas) se deja para la lectura
// del diagnóstico, que es lo que la página invita a agendar.
// Todo el contenido sale de src/config/diagnostico; aquí solo hay flujo,
// persistencia y render.
//
// El progreso se guarda en localStorage: al refrescar se retoma en la misma
// pantalla y con las mismas respuestas. Los botones atrás/adelante del
// navegador (o del celular) recorren las pantallas.

import {
  bottleneckMessages,
  calendarioEmbed,
  calendarioLink,
  challengeLine,
  challengeToDimension,
  contextQuestions,
  copy,
  countries,
  diagnosticQuestions,
  dimensions,
  maturityLevels,
  noStrengthMessage,
  opportunityTieBreak,
  professionalTarget,
  recommendations,
  scale,
  strengthMessage,
  strengthMin,
  targetMessages,
  whatsappLectura,
  whatsappLecturaMensaje,
} from "../../config/diagnostico";
import type { DimensionId } from "../../config/diagnostico";
import { computeResult, type DiagnosticResult } from "./scoring";
import { readTracking, track } from "./tracking";
import { buildPayload, sendLead, type Etapa, type LeadState } from "./lead";

const STORAGE_KEY = "jarmar-diagnostico-360";
/** Separador de las respuestas de selección múltiple. */
const SEP = " | ";
const VERSION = 1;

interface State extends LeadState {
  v: number;
  step: string;
  /** Etapas ya guardadas en el servicio de leads (evita duplicados). */
  enviados: Partial<Record<Etapa, boolean>>;
  /** Eventos que solo se registran una vez por lead. */
  eventos: Record<string, boolean>;
}

// ---------- Pasos ----------

const STEPS: string[] = [
  "hero",
  "datos",
  ...contextQuestions.map((_, i) => `ctx-${i}`),
  "escala",
  ...diagnosticQuestions.map((_, i) => `q-${i}`),
  "calculando",
  "resultado",
];
const PROGRESS_FIRST = STEPS.indexOf("datos");
const PROGRESS_LAST = STEPS.indexOf(`q-${diagnosticQuestions.length - 1}`);
const RESULT_STEPS = new Set(["resultado"]);

// ---------- Estado ----------

let state: State;
let endpoint = "";
let root: HTMLElement;
let hero: HTMLElement;
let dialog: HTMLDialogElement | null;
/** Posición en el historial de esta visita: "Anterior" usa history.back()
 *  solo si hay a dónde volver dentro del diagnóstico. */
let idx = 0;

function nuevoEstado(): State {
  return {
    v: VERSION,
    leadId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    step: "hero",
    datos: { nombre: "", email: "", telefono: "", optica: "", ciudad: "", pais: countries[0] },
    contexto: {},
    respuestas: {},
    tracking: readTracking(),
    enviados: {},
    eventos: {},
  };
}

function cargar(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s && s.v === VERSION && s.leadId) return s;
    }
  } catch {}
  return nuevoEstado();
}

function guardar() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function once(evento: string, params?: Record<string, string | number | undefined>) {
  if (state.eventos[evento]) return;
  state.eventos[evento] = true;
  guardar();
  track(evento, params);
}

// ---------- Utilidades ----------

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const dim = (id: DimensionId) => dimensions.find((d) => d.id === id)!;
const dimIndex = (id: DimensionId) => dimensions.findIndex((d) => d.id === id);

function resultado(): DiagnosticResult {
  return computeResult(dimensions, diagnosticQuestions, maturityLevels, state.respuestas, {
    tieBreak: opportunityTieBreak,
    strengthMin,
  });
}

/** Primera pantalla incompleta: a donde se manda a quien intenta saltarse pasos. */
function primerPendiente(): string {
  const d = state.datos;
  if (!d.nombre || !d.email || !d.telefono || !d.optica || !d.ciudad || !d.pais) return "datos";
  const ci = contextQuestions.findIndex((c) => !state.contexto[c.id]);
  if (ci !== -1) return `ctx-${ci}`;
  const qi = diagnosticQuestions.findIndex((q) => !q.opcional && typeof state.respuestas[q.id] !== "number");
  if (qi !== -1) return `q-${qi}`;
  return "resultado";
}

function puedeVer(step: string): boolean {
  const i = STEPS.indexOf(step);
  if (i === -1) return false;
  if (step === "hero") return true;
  const pendiente = primerPendiente();
  if (pendiente === "resultado") return true;
  return i <= STEPS.indexOf(pendiente);
}

// ---------- Navegación ----------

function ir(step: string, opciones: { push?: boolean } = {}) {
  if (!puedeVer(step)) step = primerPendiente();
  const anterior = state.step;
  state.step = step;
  guardar();
  // "calculando" es transitoria: no se queda en el historial.
  if (opciones.push !== false && step !== anterior) {
    if (anterior === "calculando") history.replaceState({ step, idx }, "");
    else history.pushState({ step, idx: ++idx }, "");
  }
  render();
}

function siguiente() {
  const i = STEPS.indexOf(state.step);
  alSalir(state.step);
  ir(STEPS[i + 1]);
}

function anterior() {
  if (idx > 0) history.back();
  else ir(STEPS[Math.max(0, STEPS.indexOf(state.step) - 1)]);
}

/** Eventos y envíos que ocurren al terminar una pantalla. */
function alSalir(step: string) {
  if (step === "datos") enviar("diagnostico_iniciado");
  if (step === `ctx-${contextQuestions.length - 1}`) once("diagnostic_context_completed");
  if (step.startsWith("q-")) {
    const i = Number(step.slice(2));
    const q = diagnosticQuestions[i];
    const sig = diagnosticQuestions[i + 1];
    if (!sig || sig.dimension !== q.dimension) {
      const clave = `diagnostic_dimension_completed:${q.dimension}`;
      if (!state.eventos[clave]) {
        state.eventos[clave] = true;
        guardar();
        track("diagnostic_dimension_completed", { dimension: q.dimension, dimension_index: dimIndex(q.dimension) + 1 });
      }
    }
  }
}

// ---------- Envío de leads ----------

const enCurso: Partial<Record<Etapa, Promise<void>>> = {};

function enviar(etapa: Etapa): Promise<void> {
  if (state.enviados[etapa]) return Promise.resolve();
  if (enCurso[etapa]) return enCurso[etapa]!;
  const r = etapa === "diagnostico_iniciado" ? null : resultado();
  const p = sendLead(endpoint, buildPayload(state, etapa, r))
    .then(() => {
      state.enviados[etapa] = true;
      guardar();
    })
    .finally(() => {
      delete enCurso[etapa];
    });
  enCurso[etapa] = p;
  // Los envíos de fondo no interrumpen al usuario si fallan; se reintentan
  // en la siguiente visita.
  p.catch((e) => console.error(`[diagnostico] No se guardó "${etapa}":`, e?.message ?? e));
  return p;
}

// ---------- Render ----------

function render() {
  const step = state.step;
  const enHero = step === "hero";
  hero.hidden = !enHero;
  root.hidden = enHero;
  document.body.classList.toggle("en-diagnostico", !enHero);

  if (enHero) {
    actualizarHero();
    window.scrollTo(0, 0);
    return;
  }

  let html = "";
  if (step === "datos") html = vistaDatos();
  else if (step.startsWith("ctx-")) html = vistaContexto(Number(step.slice(4)));
  else if (step === "escala") html = vistaEscala();
  else if (step.startsWith("q-")) html = vistaPregunta(Number(step.slice(2)));
  else if (step === "calculando") html = vistaCalculando();
  else if (step === "resultado") html = vistaResultado();

  root.innerHTML = barraProgreso(step) + `<div class="pantalla" data-step="${step}">${html}</div>`;
  window.scrollTo(0, 0);
  const foco = root.querySelector<HTMLElement>("[data-foco]");
  if (foco) foco.focus({ preventScroll: true });

  if (step === "calculando") {
    setTimeout(() => {
      if (state.step !== "calculando") return;
      once("diagnostic_completed");
      enviar("diagnostico_completado");
      ir("resultado");
    }, 1400);
  }
  if (step === "resultado") {
    const r = resultado();
    track("diagnostico_resultado_visto", { score: r.global_score, cuello_botella: r.priorities[0] });
    // Si el envío del diagnóstico falló en una visita anterior, se reintenta.
    if (!state.enviados.diagnostico_completado) enviar("diagnostico_completado");
    requestAnimationFrame(() => root.querySelectorAll<HTMLElement>(".barra-relleno").forEach((b) => (b.style.width = b.dataset.w + "%")));
  }
}

function actualizarHero() {
  const aviso = hero.querySelector<HTMLElement>("[data-continuar]");
  if (!aviso) return;
  const hayProgreso = !!state.datos.nombre;
  aviso.hidden = !hayProgreso;
}

function barraProgreso(step: string): string {
  const i = STEPS.indexOf(step);
  if (RESULT_STEPS.has(step) || step === "calculando") return "";
  const pct = Math.round(((i - PROGRESS_FIRST) / (PROGRESS_LAST - PROGRESS_FIRST + 1)) * 100);
  let etiqueta = "Tus datos";
  if (step.startsWith("ctx-")) etiqueta = copy.contexto.titulo;
  if (step === "escala") etiqueta = copy.escala.titulo;
  if (step.startsWith("q-")) {
    const q = diagnosticQuestions[Number(step.slice(2))];
    etiqueta = `Dimensión ${dimIndex(q.dimension) + 1} de ${dimensions.length}`;
  }
  return `
    <div class="progreso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Avance del diagnóstico">
      <div class="progreso-info"><span>${esc(etiqueta)}</span><span>${pct}%</span></div>
      <div class="progreso-pista"><div class="progreso-relleno" style="width:${pct}%"></div></div>
    </div>`;
}

function botonAtras(): string {
  return `<button type="button" class="btn-atras" data-accion="atras">← Anterior</button>`;
}

function vistaDatos(): string {
  const d = state.datos;
  const paisEnLista = countries.includes(d.pais);
  const opciones = countries
    .map((c) => `<option value="${esc(c)}"${(paisEnLista ? d.pais === c : c === "Otro") ? " selected" : ""}>${esc(c)}</option>`)
    .join("");
  const campo = (id: string, label: string, tipo: string, valor: string, extra = "") => `
    <div class="campo">
      <label for="f-${id}">${label}</label>
      <input id="f-${id}" name="${id}" type="${tipo}" value="${esc(valor)}" required ${extra} />
      <span class="error" id="f-${id}-err"></span>
    </div>`;
  return `
    <h2 class="pantalla-titulo" tabindex="-1" data-foco>${esc(copy.datos.titulo)}</h2>
    <p class="pantalla-texto">${esc(copy.datos.texto)}</p>
    <form class="tarjeta" data-form="datos" novalidate>
      ${campo("nombre", "Nombre completo", "text", d.nombre, 'autocomplete="name"')}
      ${campo("email", "Correo electrónico", "email", d.email, 'autocomplete="email" inputmode="email"')}
      ${campo("telefono", "Teléfono / WhatsApp", "tel", d.telefono, 'autocomplete="tel" inputmode="tel" placeholder="Ej. +52 961 000 0000"')}
      ${campo("optica", "Nombre de Óptica", "text", d.optica ?? "", 'autocomplete="organization"')}
      ${campo("ciudad", "Ciudad", "text", d.ciudad, 'autocomplete="address-level2"')}
      <div class="campo">
        <label for="f-pais">País</label>
        <select id="f-pais" name="pais">${opciones}</select>
        <input id="f-pais-otro" name="pais_otro" type="text" placeholder="Escribe tu país" value="${paisEnLista ? "" : esc(d.pais)}" ${paisEnLista && d.pais !== "Otro" ? "hidden" : ""} />
        <span class="error" id="f-pais-err"></span>
      </div>
      <button type="submit" class="btn btn-full">Continuar</button>
      <p class="privacidad">Usamos tus datos solo para enviarte tu resultado y darte seguimiento sobre el programa.</p>
    </form>`;
}

function opcionesHtml(grupo: string, opciones: string[], elegido: string | undefined, multiple = false): string {
  const elegidos = elegido ? elegido.split(SEP) : [];
  return `${multiple ? `<p class="multi-hint">Puedes elegir varias.</p>` : ""}<div class="opciones${multiple ? " opciones--multi" : ""}" role="group">${opciones
    .map((o) => {
      const on = elegidos.includes(o);
      return `<button type="button" class="opcion${on ? " activa" : ""}" aria-pressed="${on}" data-grupo="${grupo}" data-valor="${esc(o)}"${multiple ? " data-multiple" : ""}>${esc(o)}</button>`;
    })
    .join("")}</div>`;
}

function vistaContexto(i: number): string {
  const c = contextQuestions[i];
  const elegido = state.contexto[c.id];
  return `
    <p class="pantalla-eyebrow">${esc(copy.contexto.titulo)} · ${i + 1} de ${contextQuestions.length}</p>
    <h2 class="pantalla-titulo" tabindex="-1" data-foco>${esc(c.texto)}</h2>
    ${i === 0 ? `<p class="pantalla-texto">${esc(copy.contexto.texto)}</p>` : ""}
    ${opcionesHtml(`ctx:${c.id}`, c.opciones, elegido, c.multiple)}
    <div class="nav-pantalla">${botonAtras()}${
      c.multiple
        ? `<button type="button" class="btn btn-sig" data-accion="siguiente" data-sig-multi${elegido ? "" : " disabled"}>Siguiente →</button>`
        : elegido
          ? `<button type="button" class="btn btn-sig" data-accion="siguiente">Siguiente →</button>`
          : ""
    }</div>`;
}

function escalaLista(): string {
  return `<ol class="escala-lista">${scale
    .map((s) => `<li><span class="escala-num">${s.valor}</span><div><strong>${esc(s.corto)}</strong><p>${esc(s.texto)}</p></div></li>`)
    .join("")}</ol>`;
}

function vistaEscala(): string {
  return `
    <p class="pantalla-eyebrow">${dimensions.length} dimensiones · ${diagnosticQuestions.length} afirmaciones</p>
    <h2 class="pantalla-titulo" tabindex="-1" data-foco>${esc(copy.escala.titulo)}</h2>
    <p class="pantalla-texto">${esc(copy.escala.texto)}</p>
    ${escalaLista()}
    <div class="nav-pantalla">${botonAtras()}<button type="button" class="btn btn-sig" data-accion="siguiente">Comenzar →</button></div>`;
}

function vistaPregunta(i: number): string {
  const q = diagnosticQuestions[i];
  const d = dim(q.dimension);
  const elegido = state.respuestas[q.id];
  const respondida = typeof elegido === "number";
  const botones = scale
    .map(
      (s) => `
      <button type="button" class="escala-opcion${elegido === s.valor ? " activa" : ""}" aria-pressed="${elegido === s.valor}" data-grupo="q:${q.id}" data-valor="${s.valor}">
        <span class="escala-num">${s.valor}</span><span class="escala-txt">${esc(s.corto)}</span>
      </button>`,
    )
    .join("");
  return `
    <p class="pantalla-eyebrow">${esc(d.nombre)}</p>
    <h2 class="pantalla-titulo pregunta" tabindex="-1" data-foco>${esc(q.texto)}</h2>
    <div class="escala-head">
      <span>Pregunta ${i + 1} de ${diagnosticQuestions.length}${q.opcional ? " · opcional" : ""}</span>
      <button type="button" class="btn-ayuda" data-accion="ayuda" aria-haspopup="dialog">¿Qué significa cada nivel?</button>
    </div>
    <div class="escala-opciones" role="group" aria-label="Nivel de madurez">${botones}</div>
    <div class="nav-pantalla">
      ${botonAtras()}
      ${respondida ? `<button type="button" class="btn btn-sig" data-accion="siguiente">Siguiente →</button>` : q.opcional ? `<button type="button" class="btn-omitir" data-accion="omitir">Omitir esta pregunta</button>` : ""}
    </div>`;
}

function vistaCalculando(): string {
  return `
    <div class="calculando" role="status">
      <div class="spinner" aria-hidden="true"></div>
      <p tabindex="-1" data-foco>${esc(copy.calculando)}</p>
    </div>`;
}

const plantilla = (t: string, vars: Record<string, string | number>) =>
  t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? esc(String(vars[k])) : m));

function escalaMadurez(score: number, nivelId: string): string {
  const segmentos = maturityLevels
    .map((l) => `<span class="seg seg--${l.id}${l.id === nivelId ? " seg--activo" : ""}" style="flex:${l.max - l.min + 1}"></span>`)
    .join("");
  const leyenda = maturityLevels
    .map((l) => `<li class="${l.id === nivelId ? "activo" : ""}"><span class="ley-rango">${l.min}–${l.max}</span> ${esc(l.nombre)}</li>`)
    .join("");
  const meta =
    score >= professionalTarget
      ? esc(targetMessages.logrado)
      : plantilla(targetMessages.faltan, { faltan: professionalTarget - score });
  return `
    <div class="madurez" aria-label="Escala de madurez">
      <div class="madurez-barra">
        ${segmentos}
        <span class="madurez-marca" style="left:${Math.min(99, Math.max(1, score))}%"><span>Estás aquí</span></span>
      </div>
      <ol class="madurez-leyenda">${leyenda}</ol>
      <p class="madurez-meta">${meta}</p>
    </div>`;
}

/** Línea que conecta el cuello de botella con los retos que declaró: usa el
 *  reto cuya dimensión tenga el puntaje más bajo. */
function lineaReto(r: DiagnosticResult): string {
  const retos = (state.contexto.main_challenge ?? "").split(SEP).filter((x) => challengeToDimension[x]);
  if (!retos.length) return "";
  const reto = retos.reduce((a, b) => (r.dimensions[challengeToDimension[b]] < r.dimensions[challengeToDimension[a]] ? b : a));
  const d = challengeToDimension[reto];
  return `<p class="linea-reto">${plantilla(challengeLine, { reto, dimension: dim(d).corto, puntaje: r.dimensions[d] })}</p>`;
}

function enlaceWhatsApp(r: DiagnosticResult): string {
  const texto = whatsappLecturaMensaje
    .replace("{optica}", state.datos.optica || state.datos.nombre)
    .replace("{puntaje}", String(r.global_score));
  return `https://wa.me/${whatsappLectura}?text=${encodeURIComponent(texto)}`;
}

function vistaResultado(): string {
  const r = resultado();
  const nivel = maturityLevels.find((l) => l.id === r.maturity_level_id)!;
  const cuello = r.priorities[0];
  // Un solo nombre por dimensión en todo el resultado: el de las barras.
  const nombre = (id: DimensionId) => esc(dim(id).corto);

  const barras = dimensions
    .map((d) => {
      const v = r.dimensions[d.id];
      const prioridad = r.priorities.includes(d.id);
      const fortaleza = d.id === r.top_strength;
      return `
        <li class="barra${prioridad ? " barra--prioridad" : ""}${fortaleza ? " barra--fortaleza" : ""}">
          <div class="barra-info"><span>${nombre(d.id)}</span><strong>${v}</strong></div>
          <div class="barra-pista"><div class="barra-relleno" data-w="${v}" style="width:0"></div></div>
        </li>`;
    })
    .join("");

  const fortaleza = r.top_strength
    ? `<section class="bloque bloque--fortaleza">
        <h3>${esc(copy.resultado.fortaleza)}</h3>
        <p class="destacado">${nombre(r.top_strength)} — <strong>${r.dimensions[r.top_strength]}/100</strong></p>
        <p>${esc(strengthMessage)}</p>
      </section>`
    : `<section class="bloque bloque--sin-fortaleza">
        <h3>${esc(noStrengthMessage.titulo)}</h3>
        <p>${esc(noStrengthMessage.texto)}</p>
      </section>`;

  const prioridades = r.priorities
    .map((id, i) => `<li><span class="num">${i + 1}</span><span>${nombre(id)}</span><strong>${r.dimensions[id]}/100</strong></li>`)
    .join("");

  // Paso 1 abierto. Pasos 2 y 3: nombre y título reales, cuerpo de relleno
  // genérico (el texto real no se pone en la página).
  const paso1 = recommendations[cuello];
  const bloqueados = r.priorities
    .slice(1)
    .map(
      (id, i) => `
      <li>
        <button type="button" class="paso paso--bloqueado" data-accion="paso-bloqueado" aria-label="Paso ${i + 2}: se entrega en tu lectura personalizada">
          <span class="paso-num">Paso ${i + 2} · ${nombre(id)}</span>
          <h4>${esc(recommendations[id].titulo)}</h4>
          <span class="paso-cuerpo" aria-hidden="true">
            <span class="paso-blur">${esc(copy.pasosBloqueados.relleno)}</span>
            <span class="candado">🔒</span>
          </span>
        </button>
      </li>`,
    )
    .join("");

  const calendario = calendarioEmbed
    ? `<div class="calendario" data-calendario hidden>
        <p class="calendario-respaldo"><a href="${esc(calendarioLink)}" target="_blank" rel="noopener">${esc(copy.cta.respaldo)} ↗</a></p>
      </div>`
    : "";

  return `
    <section class="resultado-head">
      <p class="pantalla-eyebrow">${esc(copy.resultado.titulo)}</p>
      <h2 class="pantalla-titulo" tabindex="-1" data-foco>Tu óptica obtuvo</h2>
      <div class="score" style="--p:${r.global_score}">
        <div class="score-num"><strong>${r.global_score}</strong><span>/100</span></div>
      </div>
      <p class="nivel nivel--${nivel.id}">${esc(nivel.nombre)}</p>
      <p class="nivel-texto">${esc(nivel.texto)}</p>
      ${escalaMadurez(r.global_score, nivel.id)}
    </section>

    <section class="bloque">
      <h3>${esc(copy.resultado.dimensiones)}</h3>
      <ul class="barras">${barras}</ul>
      <p class="leyenda">${r.top_strength ? `<span class="ley ley--fortaleza"></span>Fortaleza ` : ""}<span class="ley ley--prioridad"></span>Oportunidad</p>
    </section>

    ${fortaleza}

    <section class="bloque">
      <h3>${esc(copy.resultado.prioridades)}</h3>
      <ol class="prioridades">${prioridades}</ol>
    </section>

    <section class="bloque bloque--cuello">
      <h3>${esc(copy.resultado.cuello)}: ${nombre(cuello)}</h3>
      <p>${esc(bottleneckMessages[cuello])}</p>
      ${lineaReto(r)}
    </section>

    <section class="bloque">
      <h3>${esc(copy.resultado.recomendaciones)}</h3>
      <ol class="pasos">
        <li>
          <div class="paso">
            <span class="paso-num">Paso 1 · ${nombre(cuello)}</span>
            <h4>${esc(paso1.titulo)}</h4>
            <p>${esc(paso1.texto)}</p>
          </div>
        </li>
      </ol>
      <div class="bloqueados-head">
        <strong>${esc(copy.pasosBloqueados.titulo)}</strong>
        <span>${esc(copy.pasosBloqueados.texto)}</span>
      </div>
      <ol class="pasos">${bloqueados}</ol>
    </section>

    <section class="bloque bloque--lectura">
      <h3>${esc(copy.lectura.titulo)}</h3>
      <ul class="lectura">${copy.lectura.items.map((t) => `<li><span aria-hidden="true">✅</span><span>${t}</span></li>`).join("")}</ul>
    </section>

    <section class="transicion" id="agendar">
      <h3>${esc(copy.cta.titulo)}</h3>
      <a class="btn btn-full btn-claro" href="${esc(calendarioLink)}" target="_blank" rel="noopener" data-accion="agendar">${esc(copy.cta.boton)}</a>
      ${calendario}
      <a class="link-whatsapp" href="${enlaceWhatsApp(r)}" target="_blank" rel="noopener" data-accion="whatsapp-lectura">${esc(copy.cta.whatsapp)}</a>
      <p class="cta-nota">${esc(copy.cta.nota)}</p>
    </section>

    <div class="acciones-finales">
      <button type="button" class="btn-link btn-link--chico" data-accion="reiniciar">Hacer un diagnóstico nuevo</button>
    </div>`;
}

// ---------- Interacción ----------

/** Selección múltiple: marca o desmarca sin avanzar de pantalla. */
function alternar(boton: HTMLElement) {
  const [tipo, id] = boton.dataset.grupo!.split(":");
  const on = boton.getAttribute("aria-pressed") !== "true";
  boton.classList.toggle("activa", on);
  boton.setAttribute("aria-pressed", String(on));
  const valores = [...boton.parentElement!.querySelectorAll<HTMLElement>('.opcion[aria-pressed="true"]')]
    .map((b) => b.dataset.valor!)
    .join(SEP);
  if (tipo === "ctx") {
    state.contexto[id] = valores;
    const sig = root.querySelector<HTMLButtonElement>("[data-sig-multi]");
    if (sig) sig.disabled = !valores;
  }
  guardar();
}

function elegir(boton: HTMLElement) {
  if (boton.hasAttribute("data-multiple")) return alternar(boton);
  const [tipo, id] = boton.dataset.grupo!.split(":");
  const valor = boton.dataset.valor!;
  boton.parentElement!.querySelectorAll(".opcion, .escala-opcion").forEach((b) => {
    b.classList.toggle("activa", b === boton);
    b.setAttribute("aria-pressed", String(b === boton));
  });
  if (tipo === "ctx") state.contexto[id] = valor;
  if (tipo === "q") state.respuestas[id] = Number(valor);
  guardar();
  // Avanza solo tras una pausa breve para que se vea la opción marcada.
  const step = state.step;
  setTimeout(() => {
    if (state.step === step) siguiente();
  }, 260);
}

function validarDatos(form: HTMLFormElement): boolean {
  const fd = new FormData(form);
  const v = (k: string) => String(fd.get(k) ?? "").trim();
  const pais = v("pais") === "Otro" ? v("pais_otro") : v("pais");
  const datos = { nombre: v("nombre"), email: v("email"), telefono: v("telefono"), optica: v("optica"), ciudad: v("ciudad"), pais };
  const errores: Record<string, string> = {};
  if (datos.nombre.length < 3) errores.nombre = "Escribe tu nombre completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email)) errores.email = "Escribe un correo válido.";
  if (datos.telefono.replace(/\D/g, "").length < 8 || !/^[+\d\s().-]+$/.test(datos.telefono))
    errores.telefono = "Escribe un teléfono válido (puedes incluir el código de país).";
  if (!datos.optica) errores.optica = "Escribe el nombre de tu óptica.";
  if (!datos.ciudad) errores.ciudad = "Escribe tu ciudad.";
  if (!datos.pais) errores.pais = "Indica tu país.";

  form.querySelectorAll<HTMLElement>(".campo").forEach((c) => c.classList.remove("con-error"));
  let primero: HTMLElement | null = null;
  for (const [k, msg] of Object.entries(errores)) {
    const input = form.querySelector<HTMLElement>(`#f-${k}`)!;
    const campo = input.closest(".campo")!;
    campo.classList.add("con-error");
    campo.querySelector(".error")!.textContent = msg;
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", `f-${k}-err`);
    primero ??= k === "pais" && v("pais") === "Otro" ? form.querySelector<HTMLElement>("#f-pais-otro") : input;
  }
  if (primero) {
    primero.focus();
    return false;
  }
  state.datos = datos;
  guardar();
  return true;
}

function onClick(e: MouseEvent) {
  const t = e.target as HTMLElement;
  const opcion = t.closest<HTMLElement>("[data-grupo]");
  if (opcion) return elegir(opcion);

  const accion = t.closest<HTMLElement>("[data-accion]")?.dataset.accion;
  if (!accion) return;
  if (accion === "iniciar") {
    once("diagnostic_started", { source: state.tracking.source });
    // Con progreso guardado retoma en la primera pantalla sin responder (o en
    // el resultado si ya terminó).
    ir(state.datos.nombre ? primerPendiente() : "datos");
  }
  if (accion === "reiniciar-hero" || accion === "reiniciar") {
    if (accion === "reiniciar" && !confirm("¿Quieres empezar un diagnóstico nuevo? Se borrarán las respuestas actuales de este dispositivo.")) return;
    const tracking = state.tracking;
    state = nuevoEstado();
    state.tracking = tracking;
    guardar();
    ir(accion === "reiniciar" ? "hero" : "datos");
  }
  if (accion === "atras") anterior();
  if (accion === "siguiente") siguiente();
  if (accion === "omitir") {
    const q = diagnosticQuestions[Number(state.step.slice(2))];
    delete state.respuestas[q.id];
    guardar();
    siguiente();
  }
  if (accion === "ayuda") {
    // Navegadores sin <dialog> (algunos in-app): se muestra igual con [open].
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    else dialog?.setAttribute("open", "");
  }
  if (accion === "cerrar-ayuda") {
    if (dialog && typeof dialog.close === "function") dialog.close();
    else dialog?.removeAttribute("open");
  }
  if (accion === "agendar") {
    track("clic_agendar_lectura");
    // Con la URL de inserción configurada, el calendario se abre dentro de la
    // página; sin ella (o si falla) el enlace abre la pestaña nueva.
    const caja = root.querySelector<HTMLElement>("[data-calendario]");
    if (caja) {
      e.preventDefault();
      if (!caja.querySelector("iframe")) {
        const iframe = document.createElement("iframe");
        iframe.src = calendarioEmbed;
        iframe.title = "Calendario para agendar tu lectura del diagnóstico";
        iframe.loading = "lazy";
        caja.prepend(iframe);
      }
      caja.hidden = false;
      caja.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (accion === "whatsapp-lectura") track("clic_whatsapp_lectura");
  if (accion === "paso-bloqueado") {
    track("clic_paso_bloqueado");
    root.querySelector("#agendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function onSubmit(e: SubmitEvent) {
  const form = e.target as HTMLFormElement;
  e.preventDefault();
  if (form.dataset.form === "datos" && validarDatos(form)) siguiente();
}

function onInput(e: Event) {
  const t = e.target as HTMLElement;
  if (t.id === "f-pais") {
    const otro = root.querySelector<HTMLInputElement>("#f-pais-otro")!;
    otro.hidden = (t as HTMLSelectElement).value !== "Otro";
    if (!otro.hidden) otro.focus();
  }
  const campo = t.closest(".campo");
  if (campo) {
    campo.classList.remove("con-error");
    t.removeAttribute("aria-invalid");
  }
}

// ---------- Arranque ----------

export function iniciar() {
  root = document.getElementById("diagnostico-app")!;
  hero = document.getElementById("diagnostico-hero")!;
  dialog = document.getElementById("ayuda-escala") as HTMLDialogElement | null;
  endpoint = root.dataset.endpoint ?? "";

  state = cargar();
  // La fuente es la del primer toque, salvo que la visita traiga UTMs nuevas
  // y el lead aún no haya dejado sus datos.
  const visita = readTracking();
  if (!state.datos.nombre && (new URLSearchParams(location.search).has("utm_source") || state.tracking.source === "directo")) {
    state.tracking = visita;
  }
  guardar();

  document.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit as EventListener);
  root.addEventListener("input", onInput);
  root.addEventListener("change", onInput);

  window.addEventListener("popstate", (e) => {
    const step = e.state?.step;
    idx = typeof e.state?.idx === "number" ? e.state.idx : 0;
    if (typeof step === "string") ir(step, { push: false });
    else ir("hero", { push: false });
  });

  // Abandono: se registra la pantalla y la dimensión donde se quedó.
  window.addEventListener("pagehide", () => {
    if (state.step === "hero" || RESULT_STEPS.has(state.step) || state.step === "calculando") return;
    const q = state.step.startsWith("q-") ? diagnosticQuestions[Number(state.step.slice(2))] : null;
    track("diagnostic_abandoned", { step: state.step, dimension: q?.dimension ?? "" }, true);
  });

  if (!puedeVer(state.step)) state.step = primerPendiente();
  if (state.step === "calculando") state.step = "resultado";
  history.replaceState({ step: state.step, idx: 0 }, "");
  track("diagnostic_landing_view", { source: state.tracking.source, campaign: state.tracking.campaign });
  render();
}
