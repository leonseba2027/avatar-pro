"use client";
import { colorSerie, useOscuro } from "./tema";

// Barras horizontales: etiqueta arriba, valor en la punta. Sirve para %, intensidad 1–10 y prioridad.
export function BarrasH({ items, color, max = 100, sufijo = "%", limite }: {
  items: { etiqueta: string; valor: number; detalle?: string }[]; color: string; max?: number; sufijo?: string; limite?: number;
}) {
  const oscuro = useOscuro();
  const c = colorSerie(color, oscuro);
  const tope = Math.max(max, ...items.map((i) => i.valor));
  return (
    <ul className="space-y-3">
      {items.slice(0, limite).map((it, i) => (
        <li key={i}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-[0.95rem] leading-snug">{it.etiqueta}{it.detalle && <span className="text-tenue"> · {it.detalle}</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 flex-1 rounded-r bg-suave" role="presentation">
              <div className="h-3 rounded-r" style={{ width: `${Math.max(2, (it.valor / tope) * 100)}%`, background: c }} />
            </div>
            <span className="w-14 shrink-0 text-right font-semibold tabular-nums">{it.valor}{sufijo}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
