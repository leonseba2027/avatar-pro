import { z } from "zod";

// Estructura que Claude debe devolver. Los gráficos de la Etapa 3 se basan en esto.
export const RANGOS_EDAD = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;
export const GENEROS = ["mujer", "hombre", "otro"] as const;
export const NIVELES_INGRESO = ["bajo", "medio", "alto"] as const;
export const REDES = ["instagram", "facebook", "linkedin", "tiktok", "youtube", "x", "whatsapp", "otra"] as const;

const Pct = z.number().describe("Porcentaje estimado de 0 a 100");
const Intensidad = z.number().describe("Número entero de 1 a 10");

export const AvatarSchema = z.object({
  nombre_ficticio: z.string().describe("Nombre y apellido inventados, comunes en Latinoamérica. Nunca de una persona real."),
  resumen: z.string().describe("Una sola frase que describe al avatar"),
  demografia: z.object({
    edad: z.array(z.object({ rango: z.enum(RANGOS_EDAD), porcentaje: Pct })).describe("Los 5 rangos, sumando 100"),
    genero: z.array(z.object({ genero: z.enum(GENEROS), porcentaje: Pct })).describe("Sumando 100"),
    ocupaciones: z.array(z.object({ nombre: z.string(), porcentaje: Pct })).describe("3 a 6 ocupaciones"),
    ingresos: z.array(z.object({ nivel: z.enum(NIVELES_INGRESO), porcentaje: Pct })).describe("Los 3 niveles, sumando 100"),
    ubicaciones: z.array(z.object({ pais: z.string(), ciudad: z.string().nullable(), porcentaje: Pct })).describe("3 a 8 lugares, de mayor a menor"),
    redes: z.array(z.object({ red: z.enum(REDES), porcentaje: Pct })).describe("Porcentaje del avatar que usa cada red (no suman 100)"),
  }),
  mundo_interno: z.object({
    piensa: z.array(z.string()).describe("3 a 5 pensamientos cortos"),
    dice: z.array(z.string()).describe("3 a 6 frases textuales, en primera persona, como las diría"),
    ansiedades: z.array(z.object({ texto: z.string(), intensidad: Intensidad })).describe("3 a 5"),
    miedos: z.array(z.object({ texto: z.string(), intensidad: Intensidad })).describe("3 a 5"),
    peor_escenario: z.string().describe("Su mayor miedo, en una frase"),
  }),
  metas: z.object({
    deseos: z.array(z.object({ texto: z.string(), prioridad: Intensidad })).describe("3 a 5 mayores deseos"),
    le_exigen: z.array(z.string()).describe("Qué le exigen hoy para lograr sus metas, 3 a 5"),
    le_falta: z.array(z.string()).describe("Qué le falta para lograrlo, 3 a 5"),
  }),
  emociones: z.object({
    si_logra: z.array(z.object({ emocion: z.string(), descripcion: z.string() })).describe("3 a 4"),
    si_no_logra: z.array(z.object({ emocion: z.string(), descripcion: z.string() })).describe("3 a 4"),
  }),
  camino: z.object({
    hoy: z.string().describe("Dónde está hoy, en una frase"),
    falta: z.string().describe("Qué le falta, en una frase"),
    quiere_llegar: z.string().describe("Dónde quiere llegar, en una frase"),
  }),
  marketing: z.object({
    objeciones: z.array(z.string()).describe("4 a 6 objeciones antes de comprar"),
    palabras: z.array(z.string()).describe("6 a 10 palabras que le atraen"),
    ganchos: z.array(z.string()).describe("3 a 5 frases gancho para anuncios o publicaciones"),
  }),
  cambios: z.array(z.string()).describe("Qué cambió respecto del avatar anterior y por qué, en frases cortas. Vacío si es la primera versión."),
});

export type Avatar = z.infer<typeof AvatarSchema>;
export type DatosAvatar = Omit<Avatar, "cambios">;

// --- Normalización: garantiza datos válidos para los gráficos ---
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, Math.round(Number.isFinite(n) ? n : a)));

function aCien<T extends { porcentaje: number }>(items: T[]): T[] {
  const total = items.reduce((s, i) => s + Math.max(0, i.porcentaje), 0);
  if (total <= 0) return items.map((i) => ({ ...i, porcentaje: Math.round(100 / Math.max(1, items.length)) }));
  return items.map((i) => ({ ...i, porcentaje: Math.round((Math.max(0, i.porcentaje) / total) * 100) }));
}

function completar<K extends string, T extends { porcentaje: number }>(claves: readonly K[], campo: keyof T, items: T[]): T[] {
  return claves.map((k) => items.find((i) => i[campo] === k) ?? ({ [campo]: k, porcentaje: 0 } as unknown as T));
}

export function normalizar(a: Avatar): Avatar {
  const d = a.demografia;
  return {
    ...a,
    demografia: {
      edad: aCien(completar(RANGOS_EDAD, "rango", d.edad)),
      genero: aCien(completar(GENEROS, "genero", d.genero)),
      ocupaciones: aCien(d.ocupaciones.slice(0, 6)),
      ingresos: aCien(completar(NIVELES_INGRESO, "nivel", d.ingresos)),
      ubicaciones: aCien(d.ubicaciones.slice(0, 8)).sort((x, y) => y.porcentaje - x.porcentaje),
      redes: d.redes.map((r) => ({ ...r, porcentaje: clamp(r.porcentaje, 0, 100) })).sort((x, y) => y.porcentaje - x.porcentaje),
    },
    mundo_interno: {
      ...a.mundo_interno,
      ansiedades: a.mundo_interno.ansiedades.map((x) => ({ ...x, intensidad: clamp(x.intensidad, 1, 10) })),
      miedos: a.mundo_interno.miedos.map((x) => ({ ...x, intensidad: clamp(x.intensidad, 1, 10) })).sort((x, y) => y.intensidad - x.intensidad),
    },
    metas: { ...a.metas, deseos: a.metas.deseos.map((x) => ({ ...x, prioridad: clamp(x.prioridad, 1, 10) })).sort((x, y) => y.prioridad - x.prioridad) },
  };
}
