"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Icono } from "@/components/Icono";
import { Ilustracion } from "@/components/avatar/Ilustracion";

export type ItemInicio = {
  id: string; nombre: string; color: string; icono: string;
  avatar: null | { nombre: string; semilla: number; confianza: number; edadPromedio: string; genero: string; miedo: string; deseo: string;
    rangoDominante: string; generoDominante: string; paises: string[] };
};

const GENEROS: Record<string, string> = { mujer: "Mujeres", hombre: "Hombres", otro: "Otro" };

export function ListaAvatares({ items }: { items: ItemInicio[] }) {
  const [f, setF] = useState({ servicio: "", edad: "", genero: "", pais: "" });
  const paises = useMemo(() => [...new Set(items.flatMap((i) => i.avatar?.paises ?? []))].sort(), [items]);
  const filtrados = items.filter((i) =>
    (!f.servicio || i.id === f.servicio) &&
    (!f.edad || i.avatar?.rangoDominante === f.edad) &&
    (!f.genero || i.avatar?.generoDominante === f.genero) &&
    (!f.pais || i.avatar?.paises.includes(f.pais)));
  const activos = Object.values(f).some(Boolean);
  const sel = (k: keyof typeof f, label: string, ops: [string, string][]) => (
    <div className="min-w-36 flex-1">
      <label htmlFor={`f-${k}`} className="mb-1 block text-sm font-medium">{label}</label>
      <select id={`f-${k}`} className="campo py-2.5" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
        <option value="">Todos</option>{ops.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-3" role="search" aria-label="Filtros">
        {sel("servicio", "Servicio", items.map((i) => [i.id, i.nombre]))}
        {sel("edad", "Edad predominante", ["18-24", "25-34", "35-44", "45-54", "55+"].map((r) => [r, r]))}
        {sel("genero", "Género predominante", Object.entries(GENEROS))}
        {sel("pais", "País", paises.map((p) => [p, p]))}
        {activos && <button onClick={() => setF({ servicio: "", edad: "", genero: "", pais: "" })} className="boton-secundario py-2.5"><X size={18} aria-hidden="true" /> Limpiar</button>}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{filtrados.length} servicios</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((s) => {
          const a = s.avatar;
          return (
            <li key={s.id}>
              <Link href={`/avatar/${s.id}`} className="tarjeta block h-full overflow-hidden p-0 hover:shadow-md">
                <div className="flex items-center gap-3 p-4 text-white" style={{ background: s.color }}>
                  <Icono nombre={s.icono} size={28} />
                  <h2 className="text-xl font-bold">{s.nombre}</h2>
                  {a && <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-sm">Confianza {a.confianza}%</span>}
                </div>
                {a ? (
                  <>
                    <div className="flex items-center gap-3 px-4 pt-4">
                      <Ilustracion semilla={a.semilla} tamano={48} titulo={a.nombre} />
                      <p className="font-semibold">{a.nombre}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 p-4 text-sm">
                      <div><dt className="text-tenue">Edad promedio</dt><dd className="text-lg font-semibold">{a.edadPromedio}</dd></div>
                      <div><dt className="text-tenue">Género</dt><dd className="text-lg font-semibold">{a.genero}</dd></div>
                      <div className="col-span-2"><dt className="text-tenue">Miedo principal</dt><dd className="font-semibold">{a.miedo}</dd></div>
                      <div className="col-span-2"><dt className="text-tenue">Deseo principal</dt><dd className="font-semibold">{a.deseo}</dd></div>
                    </dl>
                  </>
                ) : <p className="p-4 text-tenue">Sin avatar todavía. Tocá para crearlo.</p>}
              </Link>
            </li>
          );
        })}
        {!activos && (
          <li>
            <Link href="/servicios" className="tarjeta flex h-full min-h-40 flex-col items-center justify-center gap-2 border-dashed text-tenue hover:bg-suave">
              <Plus size={32} aria-hidden="true" /> Agregar servicio
            </Link>
          </li>
        )}
      </ul>
      {filtrados.length === 0 && <p className="tarjeta text-tenue">Ningún avatar coincide con los filtros.</p>}
    </>
  );
}
