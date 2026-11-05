"use client";
import { useState, useTransition } from "react";
import { Laptop, Smartphone, Tablet, Unplug } from "lucide-react";
import { desconectarDispositivo } from "../aprobaciones/actions";

type D = { id: string; session_id: string; nombre: string; tipo: string; ultima_conexion: string; creado_at: string };
const ICONO = { movil: Smartphone, tablet: Tablet, escritorio: Laptop } as const;

function hace(fecha: string) {
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 10) return "activo ahora";
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} días`;
}

export function ListaDispositivos({ dispositivos, actual }: { dispositivos: D[]; actual: string }) {
  const [pend, start] = useTransition();
  const [msg, setMsg] = useState("");
  const desconectar = (d: D) => {
    const mismo = d.session_id === actual;
    if (!confirm(mismo ? "¿Cerrar la sesión en este dispositivo?" : `¿Desconectar "${d.nombre}"? Va a tener que volver a iniciar sesión.`)) return;
    start(async () => {
      const r = await desconectarDispositivo(d.session_id);
      if (r.ok && r.mismo) window.location.href = "/auth/desconectado";
      else setMsg(r.ok ? `"${d.nombre}" fue desconectado.` : "No se pudo desconectar.");
    });
  };
  return (
    <>
      <p role="status" aria-live="polite" className="mb-3 text-exito">{msg}</p>
      <ul className="space-y-3">
        {dispositivos.map((d) => {
          const I = ICONO[d.tipo as keyof typeof ICONO] ?? Laptop;
          const mismo = d.session_id === actual;
          return (
            <li key={d.id} className="tarjeta flex flex-wrap items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-suave"><I size={26} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{d.nombre} {mismo && <span className="ml-1 rounded-full bg-primario px-2 py-0.5 text-xs text-white dark:text-gray-900">este dispositivo</span>}</p>
                <p className="text-sm text-tenue">Última actividad: {hace(d.ultima_conexion)} · conectado el {new Date(d.creado_at).toLocaleDateString("es-AR")}</p>
              </div>
              <button disabled={pend} onClick={() => desconectar(d)} className="boton-secundario py-2 text-peligro">
                <Unplug size={18} aria-hidden="true" /> {mismo ? "Cerrar sesión" : "Desconectar"}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
