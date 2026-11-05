import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Icono } from "@/components/Icono";
import { Ilustracion } from "@/components/avatar/Ilustracion";
import { resumenAvatar } from "@/lib/avatar/resumen";
import type { DatosAvatar } from "@/lib/avatar/esquema";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const supabase = await createClient();
  const [{ data: servicios }, { data: avatares }] = await Promise.all([
    supabase.from("servicios").select("id,nombre,color,icono").order("orden"),
    supabase.from("avatares").select("servicio_id, nombre_ficticio, semilla_ilustracion, datos, confianza"),
  ]);
  const porServicio = new Map((avatares ?? []).map((a) => [a.servicio_id, a]));

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Tus avatares</h1>
      <p className="mb-8 text-tenue">Un cliente ideal por cada servicio.</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(servicios ?? []).map((s) => {
          const a = porServicio.get(s.id);
          const r = a ? resumenAvatar(a.datos as DatosAvatar) : null;
          return (
            <li key={s.id}>
              <Link href={`/avatar/${s.id}`} className="tarjeta block h-full overflow-hidden p-0 hover:shadow-md">
                <div className="flex items-center gap-3 p-4 text-white" style={{ background: s.color }}>
                  <Icono nombre={s.icono} size={28} />
                  <h2 className="text-xl font-bold">{s.nombre}</h2>
                  {a && <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-sm" aria-label={`Confianza ${a.confianza} de 100`}>{a.confianza}%</span>}
                </div>
                {a && r ? (
                  <>
                    <div className="flex items-center gap-3 px-4 pt-4">
                      <Ilustracion semilla={a.semilla_ilustracion} tamano={48} titulo={a.nombre_ficticio} />
                      <p className="font-semibold">{a.nombre_ficticio}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 p-4 text-sm">
                      <div><dt className="text-tenue">Edad promedio</dt><dd className="text-lg font-semibold">{r.edadPromedio}</dd></div>
                      <div><dt className="text-tenue">Género</dt><dd className="text-lg font-semibold">{r.genero}</dd></div>
                      <div className="col-span-2"><dt className="text-tenue">Miedo principal</dt><dd className="font-semibold">{r.miedo}</dd></div>
                      <div className="col-span-2"><dt className="text-tenue">Deseo principal</dt><dd className="font-semibold">{r.deseo}</dd></div>
                    </dl>
                  </>
                ) : <p className="p-4 text-tenue">Sin avatar todavía. Tocá para crearlo.</p>}
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/servicios" className="tarjeta flex h-full min-h-40 flex-col items-center justify-center gap-2 border-dashed text-tenue hover:bg-suave">
            <Plus size={32} aria-hidden="true" /> Agregar servicio
          </Link>
        </li>
      </ul>
    </div>
  );
}
