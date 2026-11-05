"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORICOS, TINTA, useOscuro } from "./tema";

const NOMBRE: Record<string, string> = { mujer: "Mujeres", hombre: "Hombres", otro: "Otro / no binario" };

export function DonaGenero({ datos, alto = 150 }: { datos: { genero: string; porcentaje: number }[]; alto?: number }) {
  const oscuro = useOscuro();
  const t = TINTA[oscuro ? "oscuro" : "claro"];
  const col = CATEGORICOS[oscuro ? "oscuro" : "claro"];
  const visibles = datos.filter((d) => d.porcentaje > 0);
  const top = [...visibles].sort((a, b) => b.porcentaje - a.porcentaje)[0];
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative shrink-0" style={{ width: alto, height: alto }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={visibles} dataKey="porcentaje" nameKey="genero" innerRadius="62%" outerRadius="95%" stroke={t.superficie} strokeWidth={2} isAnimationActive={false} startAngle={90} endAngle={-270}>
              {visibles.map((d) => <Cell key={d.genero} fill={col[datos.findIndex((x) => x.genero === d.genero)]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, NOMBRE[String(n)]]} contentStyle={{ background: t.superficie, border: `1px solid ${t.grilla}`, borderRadius: 12, color: t.primaria }} />
          </PieChart>
        </ResponsiveContainer>
        {top && <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-bold">{top.porcentaje}%</p><p className="text-xs text-tenue">{NOMBRE[top.genero]}</p></div></div>}
      </div>
      <ul className="space-y-2 text-sm">
        {datos.map((d, i) => (
          <li key={d.genero} className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: col[i] }} aria-hidden="true" />
            <span>{NOMBRE[d.genero]}</span><strong className="ml-auto pl-2">{d.porcentaje}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
