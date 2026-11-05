// Anonimización ANTES de guardar o enviar a Claude (Ley 25.326: minimización).
// Quita identificadores directos y descarta oraciones con datos sensibles (art. 2 y 7).

const PATRONES: [RegExp, string | ((m: string) => string)][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]"],
  [/https?:\/\/\S+|www\.\S+/gi, "[enlace]"],
  [/(?<!\w)@\w{2,30}(?:\.\w+)*/g, "[usuario]"],
  [/\b(?:20|23|24|27|30|33|34)-?\d{8}-?\d\b/g, "[cuit]"],
  [/\b(?:dni|documento|d\.n\.i\.?)[\s:#nº°.]*\d{1,2}\.?\d{3}\.?\d{3}\b/gi, "[dni]"],
  [/(?<![$\d.,])\b\d{2}\.\d{3}\.\d{3}\b(?![.,]\d)/g, "[dni]"],
  // Teléfonos (10–15 dígitos) y tarjetas (16–19). Evita confundir años o precios.
  [/\+?\d[\d\s().-]{8,}\d/g, (m) => {
    const n = m.replace(/\D/g, "").length;
    return n >= 16 && n <= 19 ? "[tarjeta]" : n >= 10 && n <= 15 ? "[teléfono]" : m;
  }],
];

// Términos que indican datos sensibles: salud, religión, política, origen étnico, vida sexual, afiliación sindical
const SENSIBLES = [
  "diagnóstico", "diagnostico", "enfermedad", "cáncer", "cancer", "vih", "hiv", "diabetes", "depresión clínica",
  "psiquiatr", "medicación", "medicacion", "embarazo", "aborto", "discapacidad", "tratamiento médico",
  "religión", "religion", "iglesia", "católic", "catolic", "evangélic", "evangelic", "judío", "judio", "musulmán", "musulman",
  "peronis", "kirchner", "macris", "milei", "libertari", "ucr ", "partido político", "partido politico", "afiliad", "sindicato", "voto a", "voté",
  "étnic", "etnic", "raza", "indígena", "indigena", "afrodescend",
  "orientación sexual", "orientacion sexual", "gay", "lesbiana", "bisexual", "trans ", "vida sexual", "sexualidad",
  "antecedentes penales",
];

export type ResultadoAnonimizacion = { texto: string; reemplazos: number; oracionesSensibles: number };

export function anonimizar(entrada: string): ResultadoAnonimizacion {
  let texto = entrada.replace(/\u0000/g, "");
  let reemplazos = 0;
  for (const [re, rep] of PATRONES) {
    texto = texto.replace(re, (m) => {
      const r = typeof rep === "string" ? rep : rep(m);
      if (r !== m) reemplazos++;
      return r;
    });
  }
  // Descartar oraciones/líneas que mencionen datos sensibles
  let oracionesSensibles = 0;
  texto = texto
    .split(/(?<=[.!?])\s+|\n/)
    .filter((o) => {
      const l = o.toLowerCase();
      const sensible = SENSIBLES.some((s) => l.includes(s));
      if (sensible) oracionesSensibles++;
      return !sensible;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { texto, reemplazos, oracionesSensibles };
}
