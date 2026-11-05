import type { DatosAvatar } from "./esquema";

const CENTRO: Record<string, number> = { "18-24": 21, "25-34": 29.5, "35-44": 39.5, "45-54": 49.5, "55+": 60 };
const NOMBRE_GENERO: Record<string, string> = { mujer: "Mujeres", hombre: "Hombres", otro: "Otro" };

// Datos para la mini tarjeta del panel de inicio
export function resumenAvatar(d: DatosAvatar) {
  const edadProm = Math.round(d.demografia.edad.reduce((s, e) => s + CENTRO[e.rango] * e.porcentaje, 0) / 100);
  const g = [...d.demografia.genero].sort((a, b) => b.porcentaje - a.porcentaje)[0];
  return {
    edadPromedio: `${edadProm} años`,
    genero: g ? `${NOMBRE_GENERO[g.genero]} ${g.porcentaje}%` : "—",
    miedo: d.mundo_interno.miedos[0]?.texto ?? "—",
    deseo: d.metas.deseos[0]?.texto ?? "—",
    pais: d.demografia.ubicaciones[0]?.pais ?? "—",
  };
}
