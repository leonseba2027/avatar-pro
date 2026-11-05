import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/admin";

export const metadata = { title: "Trámites de consumidor" };

async function cambiarEstado(fd: FormData) {
  "use server";
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!esAdmin(user?.email)) return;
  const estado = String(fd.get("estado"));
  if (!["recibido", "en_proceso", "resuelto"].includes(estado)) return;
  await adminClient().from("tramites_consumidor").update({ estado, resuelto_at: estado === "resuelto" ? new Date().toISOString() : null }).eq("id", String(fd.get("id")));
  revalidatePath("/admin/tramites");
}

export default async function Tramites() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!esAdmin(user?.email)) notFound();
  const { data } = await adminClient().from("tramites_consumidor").select("*").order("creado_at", { ascending: false }).limit(200);
  const pendientes = (data ?? []).filter((t) => t.estado !== "resuelto").length;
  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Trámites de consumidor</h1>
      <p className="mb-6 text-tenue">Arrepentimientos y bajas. Respondé cada uno dentro de las 24 horas hábiles al email indicado. Pendientes: <strong>{pendientes}</strong>.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-borde">{["Fecha", "Código", "Tipo", "Email", "Contratación", "Comentario", "Estado"].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr></thead>
          <tbody>
            {(data ?? []).map((t) => (
              <tr key={t.id} className="border-b border-borde align-top">
                <td className="py-2 pr-3">{new Date(t.creado_at).toLocaleString("es-AR")}</td>
                <td className="py-2 pr-3 font-mono">{t.codigo}</td>
                <td className="py-2 pr-3">{t.tipo === "baja" ? "Baja" : "Arrepentimiento"}</td>
                <td className="py-2 pr-3">{t.email}</td>
                <td className="py-2 pr-3">{t.fecha_contratacion ?? "—"}</td>
                <td className="py-2 pr-3">{t.detalle ?? "—"}</td>
                <td className="py-2 pr-3">
                  <form action={cambiarEstado} className="flex gap-1">
                    <input type="hidden" name="id" value={t.id} />
                    <label className="sr-only" htmlFor={`e-${t.id}`}>Estado de {t.codigo}</label>
                    <select id={`e-${t.id}`} name="estado" defaultValue={t.estado} className="rounded-lg border border-borde bg-tarjeta px-2 py-1">
                      <option value="recibido">Recibido</option><option value="en_proceso">En proceso</option><option value="resuelto">Resuelto</option>
                    </select>
                    <button className="rounded-lg border border-borde px-2 py-1">Guardar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
