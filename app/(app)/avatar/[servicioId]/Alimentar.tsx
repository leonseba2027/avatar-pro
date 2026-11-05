"use client";
import { useActionState, useRef, useState } from "react";
import { FileUp, Trash2 } from "lucide-react";
import { TIPOS_FUENTE, nombreTipo } from "@/lib/avatar/tipos";
import { cargarFuente, eliminarFuente, type ResultadoCarga } from "./actions";

type Fuente = { id: string; tipo: string; origen: string; nombre_archivo: string | null; caracteres: number; creado_at: string; usada_en_version: number | null; contenido: string };

export function Alimentar({ servicioId, fuentes }: { servicioId: string; fuentes: Fuente[] }) {
  const form = useRef<HTMLFormElement>(null);
  const [modo, setModo] = useState<"texto" | "archivo">("texto");
  const [estado, accion, pendiente] = useActionState(async (prev: ResultadoCarga | null, fd: FormData) => {
    const r = await cargarFuente(servicioId, prev, fd);
    if (r.ok) form.current?.reset();
    return r;
  }, null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="tarjeta" aria-labelledby="t-cargar">
        <h2 id="t-cargar" className="mb-4 text-xl font-semibold">Cargar información</h2>
        <form ref={form} action={accion} className="space-y-4">
          <div>
            <label htmlFor="tipo" className="mb-1 block font-medium">¿Qué tipo de dato es?</label>
            <select id="tipo" name="tipo" required className="campo" defaultValue="">
              <option value="" disabled>Elegí una opción</option>
              {TIPOS_FUENTE.map((t) => <option key={t.valor} value={t.valor}>{t.nombre}</option>)}
            </select>
          </div>
          <div role="radiogroup" aria-label="Forma de carga" className="grid grid-cols-2 rounded-xl bg-suave p-1">
            {(["texto", "archivo"] as const).map((m) => (
              <button type="button" key={m} role="radio" aria-checked={modo === m} onClick={() => setModo(m)}
                className={`rounded-lg py-2 font-semibold ${modo === m ? "bg-tarjeta shadow" : "text-tenue"}`}>{m === "texto" ? "Pegar texto" : "Subir archivo"}</button>
            ))}
          </div>
          {modo === "texto" ? (
            <div>
              <label htmlFor="texto" className="mb-1 block font-medium">Texto</label>
              <textarea id="texto" name="texto" rows={8} className="campo" placeholder="Pegá comentarios, mensajes, respuestas de encuestas, notas de ventas o testimonios…" />
            </div>
          ) : (
            <div>
              <label htmlFor="archivo" className="mb-1 block font-medium">Archivo .txt, .csv o .pdf (máx. 4 MB)</label>
              <input id="archivo" name="archivo" type="file" accept=".txt,.csv,.pdf,text/plain,text/csv,application/pdf" className="campo file:mr-3 file:rounded-lg file:border-0 file:bg-primario file:px-3 file:py-1.5 file:text-white" />
            </div>
          )}
          <p className="text-sm text-tenue">Antes de guardar quitamos emails, teléfonos, DNI, CUIT, usuarios y enlaces, y descartamos frases con datos sensibles (salud, religión, política, origen étnico o vida sexual). No cargues nombres completos de clientes.</p>
          <button disabled={pendiente} className="boton-primario w-full"><FileUp size={20} aria-hidden="true" />{pendiente ? "Procesando…" : "Guardar dato"}</button>
          <p role="status" aria-live="polite" className={estado?.ok ? "text-exito" : "text-peligro"}>{estado?.mensaje}</p>
        </form>
      </section>

      <section className="tarjeta" aria-labelledby="t-fuentes">
        <h2 id="t-fuentes" className="mb-4 text-xl font-semibold">Datos cargados ({fuentes.length})</h2>
        {fuentes.length === 0 ? <p className="text-tenue">Todavía no cargaste datos. Sin datos reales el avatar es solo una hipótesis.</p> : (
          <ul className="divide-y divide-borde">
            {fuentes.map((f) => (
              <li key={f.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{nombreTipo(f.tipo)} {f.nombre_archivo && <span className="text-tenue">· {f.nombre_archivo}</span>}</p>
                  <p className="line-clamp-2 text-sm text-tenue">{f.contenido}</p>
                  <p className="mt-1 text-xs text-tenue">
                    {new Date(f.creado_at).toLocaleDateString("es-AR")} · {f.caracteres.toLocaleString("es-AR")} caracteres ·{" "}
                    {f.usada_en_version ? `analizado en v${f.usada_en_version}` : <strong className="text-primario">nuevo</strong>}
                  </p>
                </div>
                <button onClick={() => confirm("¿Eliminar este dato?") && eliminarFuente(servicioId, f.id)} className="rounded-lg p-2 text-peligro hover:bg-suave" aria-label={`Eliminar dato de tipo ${nombreTipo(f.tipo)}`}><Trash2 size={18} aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
