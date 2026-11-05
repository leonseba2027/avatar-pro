"use client";
import { ORDINAL, useOscuro } from "./tema";

const NOMBRE: Record<string, string> = { bajo: "Bajo", medio: "Medio", alto: "Alto" };

export function BarraIngresos({ datos }: { datos: { nivel: string; porcentaje: number }[] }) {
  const oscuro = useOscuro();
  const col = ORDINAL[oscuro ? "oscuro" : "claro"];
  const top = [...datos].sort((a, b) => b.porcentaje - a.porcentaje)[0];
  return (
    <div>
      <p className="mb-3">Predomina el nivel <strong>{NOMBRE[top.nivel].toLowerCase()}</strong> ({top.porcentaje}%)</p>
      <div className="flex h-8 gap-[2px] overflow-hidden rounded-lg" aria-hidden="true">
        {datos.map((d, i) => d.porcentaje > 0 && <div key={d.nivel} style={{ width: `${d.porcentaje}%`, background: col[i] }} />)}
      </div>
      <ul className="mt-2 grid grid-cols-3 text-sm">
        {datos.map((d, i) => (
          <li key={d.nivel} className={i === 1 ? "text-center" : i === 2 ? "text-right" : ""}>
            <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: col[i] }} aria-hidden="true" />
            {NOMBRE[d.nivel]} <strong>{d.porcentaje}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
