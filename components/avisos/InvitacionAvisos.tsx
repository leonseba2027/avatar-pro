"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { activarAvisos, esIOSsinInstalar, soportado } from "./push";

// Se muestra una sola vez, explicando para qué sirven los avisos antes de pedir el permiso
export function InvitacionAvisos() {
  const [ver, setVer] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    try {
      if (soportado() && Notification.permission === "default" && !localStorage.getItem("avisos-invitacion") && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) setVer(true);
    } catch {}
  }, []);
  const cerrar = () => { try { localStorage.setItem("avisos-invitacion", "1"); } catch {} setVer(false); };
  if (!ver) return null;
  return (
    <aside aria-label="Activar avisos" className="tarjeta mb-6 flex flex-wrap items-start gap-4 border-primario">
      <Bell size={28} className="shrink-0 text-primario" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">¿Querés recibir avisos en este dispositivo?</p>
        <p className="text-sm text-tenue">Te avisamos cuando otro dispositivo te pide aprobar una acción, cuando llega una respuesta de encuesta, cuando se actualiza un avatar o si tiene pocos datos. Podés elegir cuáles y desactivarlos cuando quieras desde Configuración.</p>
        {esIOSsinInstalar() && <p className="mt-1 text-sm text-tenue">En iPhone, primero agregá la app a la pantalla de inicio (Compartir → Agregar a inicio).</p>}
        <p role="status" className="mt-1 text-sm text-peligro">{msg}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={async () => { const r = await activarAvisos(); if (r === "ok") cerrar(); else setMsg(r === "denegado" ? "Bloqueaste los avisos. Podés habilitarlos en la configuración del navegador." : "Este navegador no permite avisos."); }} className="boton-primario py-2">Activar</button>
        <button onClick={cerrar} className="boton-secundario py-2">Ahora no</button>
      </div>
    </aside>
  );
}
