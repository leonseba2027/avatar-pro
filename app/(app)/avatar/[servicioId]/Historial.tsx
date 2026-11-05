"use client";
import { useState, useTransition } from "react";
import { History } from "lucide-react";
import { restaurarVersion } from "./actions";

type Version = { version: number; cambios: string[]; confianza: number; fuentes_analizadas: number; motivo: string; creado_at: string };
const MOTIVO: Record<string, string> = { creacion: "Creación", actualizacion: "Actualización", regeneracion: "Regeneración", restauracion: "Restauración" };

export function Historial({ servicioId, versiones, actual }: { servicioId: string; versiones: Version[]; actual: number }) {
  const [pend, start] = useTransition();
  const [msg, setMsg] = useState("");
  if (!versiones.length) return <p className="tarjeta text-tenue">Todavía no hay versiones.</p>;
  return (
    <div>
      <p role="status" aria-live="polite" className="mb-3 text-exito">{msg}</p>
      <ol className="relative space-y-4 border-l-2 border-borde pl-6">
        {versiones.map((v) => (
          <li key={v.version} className="tarjeta relative">
            <span className="absolute -left-[2.15rem] top-6 h-4 w-4 rounded-full border-2 border-tarjeta bg-primario" aria-hidden="true" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">Versión {v.version} {v.version === actual && <span className="ml-1 rounded-full bg-primario px-2 py-0.5 text-xs text-white dark:text-gray-900">actual</span>}</h3>
              <span className="text-sm text-tenue">{new Date(v.creado_at).toLocaleString("es-AR")}</span>
            </div>
            <p className="text-sm text-tenue">{MOTIVO[v.motivo]} · {v.fuentes_analizadas} dato(s) analizado(s) · confianza {v.confianza}%</p>
            {v.cambios.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5">{v.cambios.map((c, i) => <li key={i}>{c}</li>)}</ul>}
            {v.version !== actual && (
              <button disabled={pend} onClick={() => start(async () => setMsg((await restaurarVersion(servicioId, v.version)).mensaje))} className="boton-secundario mt-3 py-2 text-sm">
                <History size={16} aria-hidden="true" /> Restaurar esta versión
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
