export const TIPOS_FUENTE = [
  { valor: "comentario", nombre: "Comentarios" },
  { valor: "mensaje", nombre: "Mensajes" },
  { valor: "encuesta", nombre: "Encuesta" },
  { valor: "nota_venta", nombre: "Notas de ventas" },
  { valor: "testimonio", nombre: "Testimonios" },
  { valor: "otro", nombre: "Otro" },
] as const;
export type TipoFuente = (typeof TIPOS_FUENTE)[number]["valor"];
export const nombreTipo = (t: string) => TIPOS_FUENTE.find((x) => x.valor === t)?.nombre ?? t;
