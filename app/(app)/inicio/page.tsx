import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Icono } from "@/components/Icono";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const supabase = await createClient();
  const { data: servicios } = await supabase.from("servicios").select("id,nombre,color,icono").order("orden");

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Tus avatares</h1>
      <p className="mb-8 text-tenue">Un cliente ideal por cada servicio.</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(servicios ?? []).map((s) => (
          <li key={s.id} className="tarjeta overflow-hidden p-0">
            <div className="flex items-center gap-3 p-4 text-white" style={{ background: s.color }}>
              <Icono nombre={s.icono} size={28} />
              <h2 className="text-xl font-bold">{s.nombre}</h2>
            </div>
            <dl className="grid grid-cols-2 gap-3 p-4 text-sm">
              {[["Edad promedio", "—"], ["Género", "—"], ["Miedo principal", "—"], ["Deseo principal", "—"]].map(([k, v]) => (
                <div key={k}><dt className="text-tenue">{k}</dt><dd className="text-lg font-semibold">{v}</dd></div>
              ))}
            </dl>
            <p className="border-t border-borde px-4 py-3 text-sm text-tenue">Sin avatar todavía · se genera en la Etapa 2</p>
          </li>
        ))}
        <li>
          <Link href="/servicios" className="tarjeta flex h-full min-h-40 flex-col items-center justify-center gap-2 border-dashed text-tenue hover:bg-suave">
            <Plus size={32} aria-hidden="true" /> Agregar servicio
          </Link>
        </li>
      </ul>
    </div>
  );
}
