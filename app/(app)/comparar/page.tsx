import { createClient } from "@/lib/supabase/server";
import type { DatosAvatar } from "@/lib/avatar/esquema";
import { Comparador } from "./Comparador";

export const metadata = { title: "Comparar avatares" };

export default async function Comparar({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const supabase = await createClient();
  const [{ data: servicios }, { data: avatares }] = await Promise.all([
    supabase.from("servicios").select("id, nombre, color, icono").order("orden"),
    supabase.from("avatares").select("servicio_id, nombre_ficticio, semilla_ilustracion, datos, confianza"),
  ]);
  const disponibles = (servicios ?? []).flatMap((s) => {
    const a = (avatares ?? []).find((x) => x.servicio_id === s.id);
    return a ? [{ ...s, avatar: { ...a, datos: a.datos as DatosAvatar } }] : [];
  });
  const ids = (await searchParams).ids?.split(",").filter(Boolean);
  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Comparar avatares</h1>
      <p className="mb-6 text-tenue">Elegí 2 o 3 servicios para verlos lado a lado.</p>
      {disponibles.length < 2
        ? <p className="tarjeta text-tenue">Necesitás al menos 2 avatares generados para comparar.</p>
        : <Comparador items={disponibles} inicial={ids?.length ? ids : disponibles.slice(0, 2).map((d) => d.id)} />}
    </div>
  );
}
