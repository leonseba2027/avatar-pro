"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

const PASOS = ["Leyendo tus datos…", "Buscando patrones…", "Armando el mundo interno…", "Calculando la demografía…", "Revisando los cambios…"];

export function BotonGenerar({ servicioId, existe, nuevos }: { servicioId: string; existe: boolean; nuevos: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState<null | "actualizar" | "regenerar">(null);
  const [paso, setPaso] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string; cambios?: string[] } | null>(null);

  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(() => setPaso((p) => (p + 1) % PASOS.length), 6000);
    return () => clearInterval(t);
  }, [cargando]);

  async function generar(modo: "actualizar" | "regenerar") {
    if (modo === "regenerar" && !confirm("Se va a reconstruir el avatar desde cero con todos los datos. La versión actual queda en el historial. ¿Continuar?")) return;
    setCargando(modo); setPaso(0); setMsg(null);
    try {
      const r = await fetch("/api/avatar/generar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ servicioId, modo }) });
      const j = await r.json();
      if (!r.ok) setMsg({ ok: false, texto: j.error ?? "Error" });
      else { setMsg({ ok: true, texto: `Avatar actualizado a la versión ${j.version}.`, cambios: j.cambios }); router.refresh(); }
    } catch {
      setMsg({ ok: false, texto: "Se cortó la conexión. Revisá internet e intentá de nuevo." });
    }
    setCargando(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => generar("actualizar")} disabled={!!cargando || (existe && nuevos === 0)} className="boton-primario">
          <Sparkles size={20} aria-hidden="true" />
          {cargando === "actualizar" ? "Analizando…" : existe ? `Actualizar avatar${nuevos ? ` (${nuevos} dato${nuevos > 1 ? "s" : ""} nuevo${nuevos > 1 ? "s" : ""})` : ""}` : "Generar avatar"}
        </button>
        {existe && (
          <button onClick={() => generar("regenerar")} disabled={!!cargando} className="boton-secundario">
            <RefreshCw size={20} aria-hidden="true" /> {cargando === "regenerar" ? "Regenerando…" : "Regenerar desde cero"}
          </button>
        )}
      </div>
      {existe && nuevos === 0 && !cargando && <p className="text-sm text-tenue">Cargá datos nuevos en “Alimentar” para poder actualizarlo.</p>}
      <div role="status" aria-live="polite">
        {cargando && <p className="flex items-center gap-2 text-tenue"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primario border-t-transparent" aria-hidden="true" />{PASOS[paso]} Puede tardar hasta 2 minutos.</p>}
        {msg && (
          <div className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100" : "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-100"}`}>
            <p className="font-semibold">{msg.texto}</p>
            {msg.cambios && msg.cambios.length > 0 && <ul className="mt-2 list-disc pl-5">{msg.cambios.map((c, i) => <li key={i}>{c}</li>)}</ul>}
          </div>
        )}
      </div>
    </div>
  );
}
