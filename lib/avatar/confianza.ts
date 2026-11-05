// Nivel de confianza 0–100 según la cantidad y calidad de datos reales.
export type FuenteResumen = { tipo: string; caracteres: number; creado_at: string };

export function calcularConfianza(fuentes: FuenteResumen[]): number {
  if (fuentes.length === 0) return 5; // hipótesis pura
  const cantidad = Math.min(40, fuentes.length * 4);                          // 10 fuentes = 40
  const volumen = Math.min(30, Math.round((fuentes.reduce((s, f) => s + f.caracteres, 0) / 1000) * 1.5)); // 20.000 caracteres = 30
  const variedad = Math.min(18, new Set(fuentes.map((f) => f.tipo)).size * 6); // 3 tipos = 18
  const hace90 = Date.now() - 90 * 864e5;
  const recientes = fuentes.filter((f) => new Date(f.creado_at).getTime() > hace90).length / fuentes.length;
  return Math.min(100, cantidad + volumen + variedad + Math.round(recientes * 12));
}

export function etiquetaConfianza(c: number) {
  if (c < 30) return { texto: "Baja", detalle: "Es casi una hipótesis. Cargá más datos reales." };
  if (c < 65) return { texto: "Media", detalle: "Va tomando forma. Sumá otros tipos de datos." };
  return { texto: "Alta", detalle: "Basado en bastante información real." };
}

export const POCOS_DATOS = 30;
