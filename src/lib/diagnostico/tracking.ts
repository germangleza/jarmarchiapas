// Atribución (UTMs / referrer) y eventos de analítica del Diagnóstico 360.
// Los eventos van a Google (gtag, ya cargado en el <head>) y a Microsoft
// Clarity; ambos son opcionales: si un bloqueador los quita, el diagnóstico
// sigue funcionando igual.

import { leadSources, referrerSources } from "../../config/diagnostico/leadSources";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export interface Tracking {
  source: string;
  source_label: string;
  medium: string;
  campaign: string;
  utm_term: string;
  utm_content: string;
  referrer: string;
  landing_url: string;
}

/** Lee UTMs y referrer de la visita actual. Se guarda una sola vez por lead
 *  (primer toque), así que volver a entrar sin UTMs no borra la fuente. */
export function readTracking(): Tracking {
  const q = new URLSearchParams(location.search);
  const referrer = document.referrer && !document.referrer.startsWith(location.origin + location.pathname)
    ? document.referrer
    : "";

  let source = (q.get("utm_source") || q.get("source") || q.get("ref") || "").trim().toLowerCase();
  if (!source && referrer) {
    const host = safeHost(referrer);
    const match = Object.keys(referrerSources).find((dom) => host.includes(dom));
    source = match ? referrerSources[match] : host;
  }
  if (!source) source = "directo";

  return {
    source,
    source_label: leadSources[source] ?? source,
    medium: (q.get("utm_medium") || (referrer ? "referral" : "none")).trim(),
    campaign: (q.get("utm_campaign") || "").trim(),
    utm_term: (q.get("utm_term") || "").trim(),
    utm_content: (q.get("utm_content") || "").trim(),
    referrer,
    landing_url: location.href,
  };
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function track(event: string, params: Record<string, string | number | undefined> = {}, beacon = false) {
  const datos = { event_category: "diagnostico_360", ...params };
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, beacon ? { ...datos, transport_type: "beacon" } : datos);
    }
  } catch {}
  try {
    if (typeof window.clarity === "function") window.clarity("event", event);
  } catch {}
}
