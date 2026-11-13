// Motor blog-agent: utilidades SEO/GEO para posts.
// Extrae la sección "## Preguntas frecuentes" del Markdown para generar el
// FAQPage JSON-LD con el MISMO texto que se ve en la página.

export interface FaqItem {
  question: string;
  answer: string;
}

/** Quita la sintaxis Markdown para dejar texto plano (para JSON-LD). */
export function markdownATexto(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lee la sección "## Preguntas frecuentes" (preguntas en ###) del cuerpo del post. */
export function extraerFaq(body: string | undefined): FaqItem[] {
  if (!body) return [];
  const start = body.search(/^##\s+Preguntas frecuentes\s*$/m);
  if (start === -1) return [];
  const rest = body.slice(start).split('\n').slice(1).join('\n');
  const end = rest.search(/^##\s+/m);
  const section = end === -1 ? rest : rest.slice(0, end);
  return section
    .split(/^###\s+/m)
    .slice(1)
    .map((block) => {
      const [first, ...lines] = block.split('\n');
      return { question: markdownATexto(first), answer: markdownATexto(lines.join('\n')) };
    })
    .filter((f) => f.question && f.answer);
}
