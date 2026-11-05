import { MapPin } from "lucide-react";
import { BarrasH } from "@/components/graficos/BarrasH";

// Ranking por país (sumando ciudades) y detalle de ciudades
export function Ubicacion({ datos, color }: { datos: { pais: string; ciudad: string | null; porcentaje: number }[]; color: string }) {
  const paises = Object.entries(datos.reduce<Record<string, number>>((a, d) => ({ ...a, [d.pais]: (a[d.pais] ?? 0) + d.porcentaje }), {}))
    .sort((a, b) => b[1] - a[1]);
  const ciudades = datos.filter((d) => d.ciudad);
  return (
    <div className="space-y-4">
      <BarrasH color={color} items={paises.map(([p, v]) => ({ etiqueta: p, valor: v }))} limite={5} />
      {ciudades.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-tenue">Ciudades principales</p>
          <ul className="flex flex-wrap gap-2">
            {ciudades.slice(0, 6).map((c, i) => (
              <li key={i} className="flex items-center gap-1 rounded-full bg-suave px-3 py-1 text-sm">
                <MapPin size={14} aria-hidden="true" /> {c.ciudad} <strong>{c.porcentaje}%</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
