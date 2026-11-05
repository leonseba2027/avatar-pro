// Planes y precios. COMPLETAR con tus valores reales antes de vender.
// Los precios se cargan FINALES en pesos argentinos (con todos los impuestos incluidos).
export const ALICUOTA_IVA = 0.21;

export const PLANES = [
  { id: "inicial", nombre: "Inicial", precioFinalARS: 0, periodo: "mes", detalle: ["Hasta 3 servicios", "5 análisis por día", "Encuesta pública"], completar: true },
  { id: "pro", nombre: "Profesional", precioFinalARS: 0, periodo: "mes", detalle: ["Servicios ilimitados", "20 análisis por día", "Encuestas y comparaciones", "Exportar fichas"], completar: true },
];

// Régimen de Transparencia Fiscal al Consumidor: se informa el IVA contenido en el precio final
export function ivaContenido(precioFinal: number, alicuota = ALICUOTA_IVA) {
  return Math.round((precioFinal - precioFinal / (1 + alicuota)) * 100) / 100;
}

export const pesos = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
