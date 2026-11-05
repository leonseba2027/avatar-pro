import { createClient } from "@/lib/supabase/server";
import { GestorServicios } from "./GestorServicios";
import type { Servicio } from "@/lib/servicios";

export const metadata = { title: "Servicios" };

export default async function Servicios() {
  const supabase = await createClient();
  const { data } = await supabase.from("servicios").select("id,nombre,descripcion,color,icono,orden").order("orden");
  return <GestorServicios servicios={(data ?? []) as Servicio[]} />;
}
