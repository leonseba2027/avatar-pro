import { z } from "zod";

// Datos demográficos: SOLO rangos y categorías generales (nada que identifique a la persona)
export const DEMOGRAFIA = {
  edad: { etiqueta: "¿En qué rango de edad estás?", opciones: ["18-24", "25-34", "35-44", "45-54", "55+", "Prefiero no decir"] },
  genero: { etiqueta: "¿Con qué género te identificás?", opciones: ["Mujer", "Hombre", "Otro", "Prefiero no decir"] },
  pais: { etiqueta: "¿En qué país vivís?", opciones: ["Argentina", "Uruguay", "Chile", "Paraguay", "Bolivia", "Perú", "Colombia", "México", "España", "Otro"] },
  ocupacion: { etiqueta: "¿Cuál describe mejor tu ocupación?", opciones: ["Empleado/a", "Independiente / freelance", "Dueño/a de empresa o emprendimiento", "Gerente o directivo/a", "Estudiante", "Otro"] },
  ingresos: { etiqueta: "¿Cómo describirías tu nivel de ingresos?", opciones: ["Bajo", "Medio", "Alto", "Prefiero no decir"] },
  redes: { etiqueta: "¿Qué redes usás todos los días? (podés elegir varias)", opciones: ["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube", "X (Twitter)", "WhatsApp"] },
} as const;

export const preguntasIniciales = (servicio: string) => [
  { id: "p1", texto: `¿Qué es lo que más te preocupa hoy en relación con ${servicio.toLowerCase()}?` },
  { id: "p2", texto: "¿Qué te gustaría lograr en los próximos 6 meses?" },
  { id: "p3", texto: "¿Qué te frena o te hizo dudar antes de contratar un servicio así?" },
  { id: "p4", texto: "¿Cómo te sentirías si lo lograras?" },
  { id: "p5", texto: "Si tuvieras que describir tu situación actual en una frase, ¿cuál sería?" },
];

export const PreguntaSchema = z.object({ id: z.string().regex(/^p\d{1,3}$/), texto: z.string().trim().min(5).max(200) });
export const EncuestaEdicionSchema = z.object({
  titulo: z.string().trim().min(3).max(120),
  introduccion: z.string().trim().max(600),
  incluir_demografia: z.boolean(),
  preguntas: z.array(PreguntaSchema).min(1).max(8),
});

const opcion = <T extends readonly string[]>(xs: T) => z.enum(xs as unknown as [string, ...string[]]).optional();
export const RespuestaSchema = z.object({
  consentimiento: z.literal(true),
  web: z.string().max(0).optional(),            // trampa para robots: debe venir vacío
  turnstile: z.string().optional(),
  demografia: z.object({
    edad: opcion(DEMOGRAFIA.edad.opciones), genero: opcion(DEMOGRAFIA.genero.opciones), pais: opcion(DEMOGRAFIA.pais.opciones),
    ocupacion: opcion(DEMOGRAFIA.ocupacion.opciones), ingresos: opcion(DEMOGRAFIA.ingresos.opciones),
    redes: z.array(z.enum(DEMOGRAFIA.redes.opciones as unknown as [string, ...string[]])).max(7).optional(),
  }).optional(),
  abiertas: z.record(z.string().regex(/^p\d{1,3}$/), z.string().max(1500)),
});
export type Respuesta = z.infer<typeof RespuestaSchema>;
