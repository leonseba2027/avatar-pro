"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import type { DatosAvatar } from "@/lib/avatar/esquema";
import { resumenAvatar } from "@/lib/avatar/resumen";
import { Icono } from "@/components/Icono";
import { Ilustracion } from "@/components/avatar/Ilustracion";
import { BarrasEdad } from "@/components/graficos/BarrasEdad";
import { DonaGenero } from "@/components/graficos/DonaGenero";
import { BarraIngresos } from "@/components/graficos/BarraIngresos";
import { BarrasH } from "@/components/graficos/BarrasH";
import { Velocimetro } from "@/components/graficos/Velocimetro";

type Item = { id: string; nombre: string; color: string; icono: string; avatar: { nombre_ficticio: string; semilla_ilustracion: number; datos: DatosAvatar; confianza: number } };

export function Comparador({ items, inicial }: { items: Item[]; inicial: string[] }) {
  const [sel, setSel] = useState<string[]>(inicial.slice(0, 3));
  const alternar = (id: string) => {
    const nuevo = sel.includes(id) ? sel.filter((x) => x !== id) : sel.length < 3 ? [...sel, id] : sel;
    setSel(nuevo);
    history.replaceState(null, "", `?ids=${nuevo.join(",")}`);
  };
  const elegidos = items.filter((i) => sel.includes(i.id));
  const Fila = ({ titulo, render }: { titulo: string; render: (i: Item) => React.ReactNode }) => (
    <>
      <h2 className="col-span-full mt-4 text-lg font-semibold">{titulo}</h2>
      {elegidos.map((i) => <div key={i.id} className="tarjeta min-w-0">{render(i)}</div>)}
    </>
  );

  return (
    <div>
      <fieldset className="mb-6">
        <legend className="mb-2 font-medium">Servicios ({sel.length}/3)</legend>
        <div className="flex flex-wrap gap-2">
          {items.map((i) => {
            const activo = sel.includes(i.id);
            return (
              <button key={i.id} onClick={() => alternar(i.id)} aria-pressed={activo} disabled={!activo && sel.length >= 3}
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 font-medium disabled:opacity-40 ${activo ? "text-white" : "bg-tarjeta"}`}
                style={{ borderColor: i.color, background: activo ? i.color : undefined }}>
                {activo ? <Check size={18} aria-hidden="true" /> : <Icono nombre={i.icono} size={18} />} {i.nombre}
              </button>
            );
          })}
        </div>
      </fieldset>

      {elegidos.length < 2 ? <p className="tarjeta text-tenue">Elegí al menos 2 servicios.</p> : (
        <div className={`grid gap-4 ${elegidos.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {elegidos.map((i) => (
            <div key={i.id} className="tarjeta flex items-center gap-3" style={{ borderTop: `6px solid ${i.color}` }}>
              <Ilustracion semilla={i.avatar.semilla_ilustracion} tamano={64} titulo={i.avatar.nombre_ficticio} />
              <div className="min-w-0"><p className="font-semibold" style={{ color: i.color }}>{i.nombre}</p><p className="text-xl font-bold">{i.avatar.nombre_ficticio}</p></div>
            </div>
          ))}
          <Fila titulo="Resumen" render={(i) => {
            const r = resumenAvatar(i.avatar.datos);
            return <dl className="grid grid-cols-2 gap-2 text-sm">{[["Edad promedio", r.edadPromedio], ["Género", r.genero], ["País", r.pais]].map(([k, v]) => <div key={k}><dt className="text-tenue">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>;
          }} />
          <Fila titulo="Confianza" render={(i) => <Velocimetro valor={i.avatar.confianza} tamano={160} />} />
          <Fila titulo="Edad" render={(i) => <BarrasEdad datos={i.avatar.datos.demografia.edad} color={i.color} alto={170} />} />
          <Fila titulo="Género" render={(i) => <DonaGenero datos={i.avatar.datos.demografia.genero} alto={120} />} />
          <Fila titulo="Ingresos" render={(i) => <BarraIngresos datos={i.avatar.datos.demografia.ingresos} />} />
          <Fila titulo="Miedos principales" render={(i) => <BarrasH color={i.color} max={10} sufijo="/10" limite={3} items={i.avatar.datos.mundo_interno.miedos.map((x) => ({ etiqueta: x.texto, valor: x.intensidad }))} />} />
          <Fila titulo="Deseos principales" render={(i) => <BarrasH color={i.color} max={10} sufijo="/10" limite={3} items={i.avatar.datos.metas.deseos.map((x) => ({ etiqueta: x.texto, valor: x.prioridad }))} />} />
          <Fila titulo="Qué dice" render={(i) => <p className="rounded-2xl rounded-bl-sm bg-suave px-4 py-3">“{i.avatar.datos.mundo_interno.dice[0]}”</p>} />
        </div>
      )}
    </div>
  );
}
