// Ilustración genérica generada a partir de una semilla (nunca fotos reales)
const PIELES = ["#f2d3b1", "#e0ac83", "#c68a5e", "#a26a42", "#7a4b2a"];
const PELOS = ["#2b1b12", "#5a3a22", "#a0662f", "#d9b26a", "#6b6b6b", "#1f1f1f"];
const ROPAS = ["#4338ca", "#047857", "#be185d", "#b45309", "#0369a1", "#7c3aed"];

export function Ilustracion({ semilla, tamano = 96, titulo }: { semilla: number; tamano?: number; titulo: string }) {
  const r = (n: number, m: number) => Math.floor((semilla / Math.pow(7, n)) % m);
  const piel = PIELES[r(0, PIELES.length)], pelo = PELOS[r(1, PELOS.length)], ropa = ROPAS[r(2, ROPAS.length)];
  const peinado = r(3, 3);
  return (
    <svg viewBox="0 0 120 120" width={tamano} height={tamano} role="img" aria-label={`Ilustración genérica de ${titulo}`}>
      <circle cx="60" cy="60" r="60" fill="var(--suave)" />
      <path d="M20 118c4-26 20-40 40-40s36 14 40 40z" fill={ropa} />
      <rect x="52" y="64" width="16" height="16" rx="6" fill={piel} />
      {peinado === 2 && <path d="M30 60c0-34 60-34 60 0v26H30z" fill={pelo} />}
      <circle cx="60" cy="50" r="22" fill={piel} />
      {peinado === 0 && <path d="M38 48c0-18 44-18 44 0-8-8-36-8-44 0z" fill={pelo} />}
      {peinado === 1 && <path d="M38 50c-2-22 46-24 44 0-6-12-22-14-28-6-6-4-14 0-16 6z" fill={pelo} />}
      {peinado === 2 && <path d="M38 48c0-20 44-20 44 0-12-6-32-6-44 0z" fill={pelo} />}
      <circle cx="52" cy="52" r="2.4" fill="#1f2937" /><circle cx="68" cy="52" r="2.4" fill="#1f2937" />
      <path d="M53 61q7 5 14 0" stroke="#1f2937" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
