"use client";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { colorSerie, TINTA, useOscuro } from "./tema";

export function BarrasEdad({ datos, color, alto = 200 }: { datos: { rango: string; porcentaje: number }[]; color: string; alto?: number }) {
  const oscuro = useOscuro();
  const t = TINTA[oscuro ? "oscuro" : "claro"];
  const max = Math.max(...datos.map((d) => d.porcentaje));
  return (
    <div style={{ height: alto }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 24, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={t.grilla} />
          <XAxis dataKey="rango" tick={{ fill: t.secundaria, fontSize: 13 }} tickLine={false} axisLine={{ stroke: t.base }} />
          <YAxis tick={{ fill: t.secundaria, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" domain={[0, Math.max(10, Math.ceil(max / 10) * 10)]} />
          <Tooltip cursor={{ fill: t.grilla, opacity: 0.4 }} formatter={(v) => [`${v}%`, "Porcentaje"]} labelFormatter={(l) => `Edad ${l}`}
            contentStyle={{ background: t.superficie, border: `1px solid ${t.grilla}`, borderRadius: 12, color: t.primaria }} />
          <Bar dataKey="porcentaje" fill={colorSerie(color, oscuro)} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
            <LabelList dataKey="porcentaje" position="top" formatter={(v) => `${v}%`} style={{ fill: t.primaria, fontSize: 13, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
