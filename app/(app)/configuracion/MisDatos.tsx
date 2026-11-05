"use client";
import { useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { cambiarComunicaciones, eliminarCuenta } from "./cuenta-actions";

export function MisDatos({ comunicaciones }: { comunicaciones: boolean }) {
  const [pend, start] = useTransition();
  const [txt, setTxt] = useState("");
  const [msg, setMsg] = useState("");
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="space-y-5">
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-0.5 h-5 w-5" checked={comunicaciones} disabled={pend} onChange={(e) => start(() => cambiarComunicaciones(e.target.checked))} />
        <span><strong>Recibir avisos y novedades por email</strong><span className="block text-sm text-tenue">Podés activarlo o revocarlo cuando quieras.</span></span>
      </label>
      <div className="flex flex-wrap gap-3">
        <a href="/api/mis-datos" className="boton-secundario"><Download size={20} aria-hidden="true" /> Descargar mis datos</a>
        <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="boton-secundario text-peligro"><Trash2 size={20} aria-hidden="true" /> Eliminar mi cuenta</button>
      </div>
      {abierto && (
        <form className="space-y-3 rounded-xl border-2 border-peligro p-4" onSubmit={(e) => { e.preventDefault(); start(async () => {
          const r = await eliminarCuenta(txt);
          if (r.ok) window.location.href = `/cuenta-eliminada?codigo=${r.codigo}`; else setMsg(r.mensaje);
        }); }}>
          <p className="font-semibold">Se borrarán para siempre tu cuenta, servicios, avatares, datos cargados, encuestas y respuestas.</p>
          <p className="text-sm text-tenue">Te recomendamos descargar tus datos antes. Si tenés una suscripción paga, también se da de baja.</p>
          <label htmlFor="conf-eliminar" className="block font-medium">Escribí ELIMINAR para confirmar</label>
          <input id="conf-eliminar" className="campo" value={txt} onChange={(e) => setTxt(e.target.value)} autoComplete="off" />
          {msg && <p role="alert" className="text-peligro">{msg}</p>}
          <button disabled={pend || txt.trim().toUpperCase() !== "ELIMINAR"} className="boton bg-peligro text-white">{pend ? "Eliminando…" : "Eliminar mi cuenta definitivamente"}</button>
        </form>
      )}
    </div>
  );
}
