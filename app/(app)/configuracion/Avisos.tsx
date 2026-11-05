"use client";
import { useEffect, useState, useTransition } from "react";
import { BellOff, BellRing } from "lucide-react";
import { activarAvisos, desactivarAvisos, esIOSsinInstalar, soportado, suscripto } from "@/components/avisos/push";
import { guardarPreferencias, probarAviso } from "./avisos-actions";

type Prefs = { avatar: boolean; encuesta: boolean; aprobacion: boolean; pocos_datos: boolean };
const TIPOS: { k: keyof Prefs; t: string; d: string }[] = [
  { k: "aprobacion", t: "Permisos pendientes", d: "Cuando otro dispositivo pide aprobar una acción" },
  { k: "encuesta", t: "Respuestas de encuesta", d: "Cuando alguien responde tu encuesta" },
  { k: "avatar", t: "Avatar actualizado", d: "Cuando un avatar tiene una versión nueva" },
  { k: "pocos_datos", t: "Pocos datos", d: "Cuando un avatar tiene confianza baja" },
];

export function Avisos({ prefs }: { prefs: Prefs }) {
  const [activo, setActivo] = useState<boolean | null>(null);
  const [p, setP] = useState(prefs);
  const [msg, setMsg] = useState("");
  const [pend, start] = useTransition();
  useEffect(() => { suscripto().then(setActivo); }, []);
  const configurado = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const cambiar = (k: keyof Prefs) => {
    const n = { ...p, [k]: !p[k] };
    setP(n);
    start(async () => setMsg((await guardarPreferencias(n)) ? "Preferencias guardadas." : "No se pudo guardar."));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-tenue">Los avisos llegan a este dispositivo aunque la app esté cerrada. Solo se envían si los activás, y podés elegir cada tipo.</p>
      {!configurado ? <p className="text-sm text-peligro">Los avisos todavía no están configurados en el servidor (faltan las claves VAPID; ver README).</p>
        : !soportado() ? <p className="text-sm text-tenue">Este navegador no permite avisos.{esIOSsinInstalar() && " En iPhone, agregá la app a la pantalla de inicio y abrila desde ahí."}</p>
        : (
          <div className="flex flex-wrap items-center gap-3">
            {activo ? (
              <>
                <span className="flex items-center gap-2 font-semibold text-exito"><BellRing size={20} aria-hidden="true" /> Activados en este dispositivo</span>
                <button onClick={() => start(async () => { await probarAviso(); setMsg("Aviso de prueba enviado."); })} className="boton-secundario py-2 text-sm">Enviar prueba</button>
                <button onClick={() => start(async () => { await desactivarAvisos(); setActivo(false); })} className="boton-secundario py-2 text-sm"><BellOff size={16} aria-hidden="true" /> Desactivar aquí</button>
              </>
            ) : (
              <button onClick={() => start(async () => {
                const r = await activarAvisos();
                if (r === "ok") setActivo(true);
                setMsg({ ok: "Avisos activados.", denegado: "Bloqueaste los avisos: habilitalos en la configuración del navegador para este sitio.", "no-soportado": "Este navegador no permite avisos.", error: "No se pudieron activar." }[r]);
              })} disabled={pend} className="boton-primario"><BellRing size={20} aria-hidden="true" /> Activar avisos en este dispositivo</button>
            )}
          </div>
        )}
      <fieldset className="divide-y divide-borde rounded-xl border border-borde">
        <legend className="sr-only">Tipos de aviso</legend>
        {TIPOS.map((t) => (
          <label key={t.k} className="flex cursor-pointer items-center gap-3 p-3">
            <span className="flex-1"><strong className="block">{t.t}</strong><span className="text-sm text-tenue">{t.d}</span></span>
            <input type="checkbox" role="switch" aria-checked={p[t.k]} checked={p[t.k]} onChange={() => cambiar(t.k)} className="h-6 w-6" />
          </label>
        ))}
      </fieldset>
      <p role="status" aria-live="polite" className="text-sm text-exito">{msg}</p>
    </div>
  );
}
