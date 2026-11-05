"use client";
import { useEffect, useState, useTransition } from "react";
import { Copy, EyeOff, Globe, Plus, QrCode, Share2, Trash2, X } from "lucide-react";
import { usePedirAprobacion } from "@/components/sync/Sincronizacion";
import { crearEncuesta, despublicarEncuesta, eliminarRespuesta, guardarEncuesta } from "./encuesta-actions";

type Enc = { id: string; slug: string; titulo: string; introduccion: string | null; preguntas: { id: string; texto: string }[]; incluir_demografia: boolean; publicada: boolean; respuestas_sin_analizar: number };
type Resp = { id: string; fuente_id: string | null; creado_at: string; respuestas: { demografia?: Record<string, string | string[]>; abiertas?: Record<string, string> } };

export function Encuesta({ servicioId, encuesta, respuestas, total, umbral }: { servicioId: string; encuesta: Enc | null; respuestas: Resp[]; total: number; umbral: number }) {
  const [pend, start] = useTransition();
  const pedir = usePedirAprobacion();
  const [e, setE] = useState(encuesta);
  const [msg, setMsg] = useState("");
  const [qr, setQr] = useState("");
  const [origen, setOrigen] = useState("");
  useEffect(() => { setE(encuesta); }, [encuesta]);
  useEffect(() => { setOrigen(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin); }, []);

  if (!e) return (
    <div className="tarjeta text-center">
      <p className="mb-4 text-tenue">Creá una encuesta anónima y compartí el link: cada respuesta alimenta el avatar automáticamente.</p>
      <button disabled={pend} onClick={() => start(() => crearEncuesta(servicioId))} className="boton-primario"><Plus size={20} aria-hidden="true" /> Crear encuesta</button>
    </div>
  );

  const link = `${origen}/encuesta/${e.slug}`;
  const guardar = () => start(async () => setMsg((await guardarEncuesta(servicioId, e.id, { titulo: e.titulo, introduccion: e.introduccion ?? "", incluir_demografia: e.incluir_demografia, preguntas: e.preguntas })).mensaje));
  const verQr = async () => {
    const QR = await import("qrcode");
    setQr(await QR.toDataURL(link, { width: 480, margin: 2 }));
  };
  const setP = (i: number, texto: string) => setE({ ...e, preguntas: e.preguntas.map((p, j) => (j === i ? { ...p, texto } : p)) });
  const nuevoId = () => `p${Math.max(0, ...e.preguntas.map((p) => Number(p.id.slice(1)))) + 1}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="tarjeta space-y-4" aria-labelledby="t-editar">
        <h2 id="t-editar" className="text-xl font-semibold">Preguntas</h2>
        <div><label htmlFor="e-titulo" className="mb-1 block font-medium">Título</label>
          <input id="e-titulo" className="campo" maxLength={120} value={e.titulo} onChange={(x) => setE({ ...e, titulo: x.target.value })} /></div>
        <div><label htmlFor="e-intro" className="mb-1 block font-medium">Introducción</label>
          <textarea id="e-intro" rows={2} className="campo" maxLength={600} value={e.introduccion ?? ""} onChange={(x) => setE({ ...e, introduccion: x.target.value })} /></div>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={e.incluir_demografia} onChange={(x) => setE({ ...e, incluir_demografia: x.target.checked })} />
          Incluir preguntas generales (rango de edad, género, país, ocupación, ingresos, redes)</label>
        <ol className="space-y-3">
          {e.preguntas.map((p, i) => (
            <li key={p.id} className="flex items-start gap-2">
              <label htmlFor={`q-${p.id}`} className="mt-3 w-6 shrink-0 font-semibold">{i + 1}.</label>
              <textarea id={`q-${p.id}`} rows={2} className="campo" maxLength={200} value={p.texto} onChange={(x) => setP(i, x.target.value)} />
              <button onClick={() => setE({ ...e, preguntas: e.preguntas.filter((_, j) => j !== i) })} disabled={e.preguntas.length <= 1} className="mt-2 rounded-lg p-2 text-peligro hover:bg-suave" aria-label={`Quitar pregunta ${i + 1}`}><X size={20} aria-hidden="true" /></button>
            </li>
          ))}
        </ol>
        <p className="text-sm text-tenue">No preguntes nombre, email, teléfono ni datos sensibles (salud, religión, política, origen étnico, vida sexual).</p>
        <div className="flex flex-wrap gap-3">
          {e.preguntas.length < 8 && <button onClick={() => setE({ ...e, preguntas: [...e.preguntas, { id: nuevoId(), texto: "" }] })} className="boton-secundario"><Plus size={18} aria-hidden="true" /> Agregar pregunta</button>}
          <button disabled={pend} onClick={guardar} className="boton-primario">Guardar cambios</button>
        </div>
        <p role="status" aria-live="polite" className="text-exito">{msg}</p>
      </section>

      <aside className="space-y-4">
        <section className="tarjeta space-y-3" aria-labelledby="t-estado">
          <h2 id="t-estado" className="text-xl font-semibold">Estado</h2>
          <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${e.publicada ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100" : "bg-suave text-tenue"}`}>
            {e.publicada ? <><Globe size={16} aria-hidden="true" /> Publicada</> : <><EyeOff size={16} aria-hidden="true" /> Borrador (no visible)</>}
          </p>
          <p className="text-sm"><strong>{total}</strong> respuesta(s) en total · <strong>{e.respuestas_sin_analizar}</strong> de {umbral} para el próximo reanálisis automático.</p>
          {e.publicada ? (
            <>
              <div className="flex gap-2"><input readOnly value={link} className="campo py-2 text-sm" aria-label="Link de la encuesta" onFocus={(x) => x.target.select()} /></div>
              <div className="flex flex-wrap gap-2">
                <button onClick={async () => { await navigator.clipboard.writeText(link); setMsg("Link copiado."); }} className="boton-secundario py-2 text-sm"><Copy size={16} aria-hidden="true" /> Copiar</button>
                {typeof navigator !== "undefined" && "share" in navigator && <button onClick={() => navigator.share({ title: e.titulo, url: link }).catch(() => {})} className="boton-secundario py-2 text-sm"><Share2 size={16} aria-hidden="true" /> Compartir</button>}
                <button onClick={verQr} className="boton-secundario py-2 text-sm"><QrCode size={16} aria-hidden="true" /> QR</button>
              </div>
              {qr && <figure className="text-center"><img src={qr} alt={`Código QR que abre ${link}`} className="mx-auto w-48 rounded-xl bg-white p-2" /><a href={qr} download="encuesta-qr.png" className="text-sm underline">Descargar QR</a></figure>}
              <button onClick={() => start(() => despublicarEncuesta(servicioId, e.id))} className="w-full text-sm text-peligro underline">Despublicar</button>
            </>
          ) : (
            <button onClick={() => pedir("publicar_encuesta", { encuestaId: e.id })} className="boton-primario w-full"><Globe size={18} aria-hidden="true" /> Publicar (requiere aprobación)</button>
          )}
        </section>

        <section className="tarjeta" aria-labelledby="t-resp">
          <h2 id="t-resp" className="mb-3 text-xl font-semibold">Últimas respuestas</h2>
          {respuestas.length === 0 ? <p className="text-tenue">Todavía no hay respuestas.</p> : (
            <ul className="divide-y divide-borde">
              {respuestas.map((r) => (
                <li key={r.id} className="flex items-start gap-2 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-tenue">{new Date(r.creado_at).toLocaleString("es-AR")}</p>
                    <p className="line-clamp-3">{Object.values(r.respuestas.abiertas ?? {}).join(" · ") || Object.values(r.respuestas.demografia ?? {}).flat().join(", ")}</p>
                  </div>
                  <button onClick={() => confirm("¿Eliminar esta respuesta?") && start(() => eliminarRespuesta(servicioId, r.id, r.fuente_id))} className="rounded-lg p-1.5 text-peligro hover:bg-suave" aria-label="Eliminar respuesta"><Trash2 size={16} aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
