import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Aprobaciones" };

const ESTADO: Record<string, { t: string; c: string }> = {
  pendiente: { t: "Pendiente", c: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100" },
  aprobada: { t: "Aprobada", c: "bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100" },
  ejecutada: { t: "✓ Aprobada y ejecutada", c: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100" },
  rechazada: { t: "✕ Rechazada", c: "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-100" },
  vencida: { t: "Vencida", c: "bg-suave text-tenue" },
  fallida: { t: "⚠ Falló", c: "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-100" },
};

export default async function Aprobaciones() {
  const supabase = await createClient();
  const { data } = await supabase.from("aprobaciones")
    .select("id, descripcion, estado, via, resultado, creado_at, vence_at, solicitante:solicitado_por(nombre), resolvio:resuelto_por(nombre)")
    .order("creado_at", { ascending: false }).limit(50);
  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Aprobaciones</h1>
      <p className="mb-6 text-tenue">Eliminar o regenerar un avatar, eliminar un servicio, publicar la encuesta y cambiar la configuración requieren aprobación desde otro dispositivo (o con un código por email si tenés uno solo).</p>
      {!data?.length ? <p className="tarjeta text-tenue">Todavía no hay solicitudes.</p> : (
        <ul className="space-y-3">
          {data.map((a) => {
            const vencida = a.estado === "pendiente" && new Date(a.vence_at).getTime() < Date.now();
            const e = ESTADO[vencida ? "vencida" : a.estado];
            const sol = (a.solicitante as unknown as { nombre: string } | null)?.nombre;
            const res = (a.resolvio as unknown as { nombre: string } | null)?.nombre;
            return (
              <li key={a.id} className="tarjeta">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{a.descripcion}</p>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${e.c}`}>{e.t}</span>
                </div>
                <p className="mt-1 text-sm text-tenue">
                  {new Date(a.creado_at).toLocaleString("es-AR")}{sol && ` · pedida desde ${sol}`}
                  {a.via === "codigo_email" ? " · confirmada con código por email" : res ? ` · resuelta desde ${res}` : ""}
                </p>
                {a.resultado && <p className="mt-1 text-sm">{a.resultado}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
