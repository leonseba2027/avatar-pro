import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Infografia } from "@/components/avatar/Infografia";
import type { DatosAvatar } from "@/lib/avatar/esquema";

export const metadata = { title: "Exportar ficha" };

export default async function PaginaInfografia({ params }: { params: Promise<{ servicioId: string }> }) {
  const { servicioId } = await params;
  const supabase = await createClient();
  const [{ data: servicio }, { data: avatar }] = await Promise.all([
    supabase.from("servicios").select("nombre, color").eq("id", servicioId).maybeSingle(),
    supabase.from("avatares").select("datos, confianza, semilla_ilustracion").eq("servicio_id", servicioId).maybeSingle(),
  ]);
  if (!servicio || !avatar) notFound();
  return (
    <div>
      <p className="mb-4"><Link href={`/avatar/${servicioId}`} className="underline">← Volver al avatar</Link></p>
      <h1 className="mb-4 text-3xl font-bold">Exportar ficha</h1>
      <Infografia d={avatar.datos as DatosAvatar} servicio={servicio.nombre} color={servicio.color} confianza={avatar.confianza} semilla={avatar.semilla_ilustracion} />
    </div>
  );
}
