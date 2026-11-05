import Link from "next/link";
import { Columns3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resumenAvatar } from "@/lib/avatar/resumen";
import type { DatosAvatar } from "@/lib/avatar/esquema";
import { ListaAvatares, type ItemInicio } from "./ListaAvatares";

export const metadata = { title: "Inicio" };

const mayor = <T extends { porcentaje: number }>(xs: T[]) => [...xs].sort((a, b) => b.porcentaje - a.porcentaje)[0];

export default async function Inicio() {
  const supabase = await createClient();
  const [{ data: servicios }, { data: avatares }] = await Promise.all([
    supabase.from("servicios").select("id,nombre,color,icono").order("orden"),
    supabase.from("avatares").select("servicio_id, nombre_ficticio, semilla_ilustracion, datos, confianza"),
  ]);
  const items: ItemInicio[] = (servicios ?? []).map((s) => {
    const a = (avatares ?? []).find((x) => x.servicio_id === s.id);
    if (!a) return { ...s, avatar: null };
    const d = a.datos as DatosAvatar;
    const r = resumenAvatar(d);
    return {
      ...s,
      avatar: {
        nombre: a.nombre_ficticio, semilla: a.semilla_ilustracion, confianza: a.confianza,
        edadPromedio: r.edadPromedio, genero: r.genero, miedo: r.miedo, deseo: r.deseo,
        rangoDominante: mayor(d.demografia.edad)?.rango ?? "", generoDominante: mayor(d.demografia.genero)?.genero ?? "",
        paises: [...new Set(d.demografia.ubicaciones.map((u) => u.pais))],
      },
    };
  });
  const conAvatar = items.filter((i) => i.avatar).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Tus avatares</h1>
          <p className="text-tenue">Un cliente ideal por cada servicio.</p>
        </div>
        {conAvatar >= 2 && <Link href="/comparar" className="boton-secundario"><Columns3 size={20} aria-hidden="true" /> Comparar</Link>}
      </div>
      <ListaAvatares items={items} />
    </div>
  );
}
