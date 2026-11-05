import { ESTADO } from "./tema";
import { etiquetaConfianza } from "@/lib/avatar/confianza";

// Medidor semicircular 0–100 con zonas Baja / Media / Alta
export function Velocimetro({ valor, tamano = 200 }: { valor: number; tamano?: number }) {
  const v = Math.max(0, Math.min(100, valor));
  const arco = (desde: number, hasta: number) => {
    const p = (x: number) => { const a = Math.PI * (1 - x / 100); return [100 + 80 * Math.cos(a), 100 - 80 * Math.sin(a)]; };
    const [x1, y1] = p(desde), [x2, y2] = p(hasta);
    return `M${x1} ${y1} A80 80 0 0 1 ${x2} ${y2}`;
  };
  const ang = Math.PI * (1 - v / 100);
  const et = etiquetaConfianza(v);
  return (
    <figure className="flex flex-col items-center" aria-label={`Nivel de confianza: ${v} de 100, ${et.texto}`}>
      <svg viewBox="0 0 200 120" width={tamano} height={tamano * 0.6} aria-hidden="true">
        <path d={arco(0, 29)} stroke={ESTADO.critico} strokeWidth="18" fill="none" />
        <path d={arco(31, 64)} stroke={ESTADO.advertencia} strokeWidth="18" fill="none" />
        <path d={arco(66, 100)} stroke={ESTADO.bueno} strokeWidth="18" fill="none" />
        <line x1="100" y1="100" x2={100 + 64 * Math.cos(ang)} y2={100 - 64 * Math.sin(ang)} stroke="var(--texto)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="100" r="8" fill="var(--texto)" />
        <text x="22" y="118" fontSize="11" fill="var(--tenue)">0</text>
        <text x="170" y="118" fontSize="11" fill="var(--tenue)">100</text>
      </svg>
      <figcaption className="text-center">
        <span className="text-3xl font-bold">{v}</span><span className="text-tenue">/100</span>
        <span className="block font-semibold">Confianza {et.texto.toLowerCase()}</span>
        <span className="block max-w-56 text-xs text-tenue">{et.detalle}</span>
      </figcaption>
    </figure>
  );
}
