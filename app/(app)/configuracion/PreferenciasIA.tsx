"use client";
import { useState } from "react";
import { usePedirAprobacion } from "@/components/sync/Sincronizacion";

export function PreferenciasIA({ modelo, reanalisis }: { modelo: string; reanalisis: number }) {
  const pedir = usePedirAprobacion();
  const [m, setM] = useState(modelo);
  const [n, setN] = useState(reanalisis);
  const cambio = m !== modelo || n !== reanalisis;
  return (
    <form onSubmit={(e) => { e.preventDefault(); pedir("cambiar_configuracion", { modelo_ia: m, reanalisis_cada: n }); }} className="space-y-4">
      <fieldset>
        <legend className="mb-2 font-medium">Modelo de inteligencia artificial</legend>
        {[["opus", "Claude Opus 5.5", "Máxima calidad (recomendado)"], ["sonnet", "Claude Sonnet 5.5", "Más rápido y económico"]].map(([v, t, d]) => (
          <label key={v} className="mb-2 flex items-start gap-3 rounded-xl border border-borde p-3">
            <input type="radio" name="modelo" value={v} checked={m === v} onChange={() => setM(v)} className="mt-1 h-5 w-5" />
            <span><strong>{t}</strong><span className="block text-sm text-tenue">{d}</span></span>
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="reanalisis" className="mb-1 block font-medium">Reanalizar el avatar automáticamente cada</label>
        <div className="flex items-center gap-2">
          <input id="reanalisis" type="number" min={1} max={50} className="campo w-24" value={n} onChange={(e) => setN(Number(e.target.value))} />
          <span>respuestas de encuesta</span>
        </div>
      </div>
      <button disabled={!cambio || n < 1 || n > 50} className="boton-primario">Guardar (requiere aprobación)</button>
    </form>
  );
}
