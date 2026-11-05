"use client";
import { useRef, useState, useTransition } from "react";
import { Pencil, Plus, Trash2, Check } from "lucide-react";
import { Icono } from "@/components/Icono";
import { COLORES, ICONOS, type Servicio } from "@/lib/servicios";
import { eliminarServicio, guardarServicio } from "./actions";

type Borrador = { id: string | null; nombre: string; descripcion: string; color: string; icono: string };
const VACIO: Borrador = { id: null, nombre: "", descripcion: "", color: COLORES[0].valor, icono: "sparkles" };

export function GestorServicios({ servicios }: { servicios: Servicio[] }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const confirmar = useRef<HTMLDialogElement>(null);
  const [b, setB] = useState<Borrador>(VACIO);
  const [aBorrar, setABorrar] = useState<Servicio | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [pendiente, start] = useTransition();

  const abrir = (s?: Servicio) => {
    setError("");
    setB(s ? { id: s.id, nombre: s.nombre, descripcion: s.descripcion ?? "", color: s.color, icono: s.icono } : VACIO);
    dialogo.current?.showModal();
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await guardarServicio(b.id, { nombre: b.nombre, descripcion: b.descripcion, color: b.color, icono: b.icono });
      if (!r.ok) return setError(r.error ?? "Error");
      dialogo.current?.close();
      setAviso(b.id ? `Servicio "${b.nombre}" actualizado.` : `Servicio "${b.nombre}" creado.`);
    });
  };

  const borrar = () => {
    if (!aBorrar) return;
    start(async () => {
      const r = await eliminarServicio(aBorrar.id);
      confirmar.current?.close();
      setAviso(r.ok ? `Servicio "${aBorrar.nombre}" eliminado.` : r.error ?? "Error");
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <button onClick={() => abrir()} className="boton-primario"><Plus size={20} aria-hidden="true" /> Agregar servicio</button>
      </div>
      <p role="status" aria-live="polite" className="mb-4 min-h-6 text-exito">{aviso}</p>

      {servicios.length === 0 ? (
        <div className="tarjeta text-center text-tenue">Todavía no tenés servicios. Agregá el primero.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <li key={s.id} className="tarjeta flex items-center gap-4" style={{ borderLeft: `6px solid ${s.color}` }}>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: s.color }}>
                <Icono nombre={s.icono} size={28} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-semibold">{s.nombre}</h2>
                {s.descripcion && <p className="line-clamp-2 text-sm text-tenue">{s.descripcion}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => abrir(s)} className="rounded-lg p-2.5 hover:bg-suave" aria-label={`Editar ${s.nombre}`}><Pencil size={20} aria-hidden="true" /></button>
                <button onClick={() => { setABorrar(s); confirmar.current?.showModal(); }} className="rounded-lg p-2.5 text-peligro hover:bg-suave" aria-label={`Eliminar ${s.nombre}`}><Trash2 size={20} aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={dialogo} aria-labelledby="titulo-dialogo" className="m-auto w-[min(100%-2rem,32rem)] rounded-2xl bg-tarjeta p-0 text-texto backdrop:bg-black/50">
        <form onSubmit={guardar} className="space-y-5 p-6">
          <h2 id="titulo-dialogo" className="text-2xl font-bold">{b.id ? "Editar servicio" : "Nuevo servicio"}</h2>
          <div>
            <label htmlFor="s-nombre" className="mb-1 block font-medium">Nombre</label>
            <input id="s-nombre" className="campo" required maxLength={60} value={b.nombre} onChange={(e) => setB({ ...b, nombre: e.target.value })} />
          </div>
          <div>
            <label htmlFor="s-desc" className="mb-1 block font-medium">Descripción breve <span className="text-tenue">(opcional)</span></label>
            <textarea id="s-desc" className="campo" rows={2} maxLength={300} value={b.descripcion} onChange={(e) => setB({ ...b, descripcion: e.target.value })} />
          </div>
          <fieldset>
            <legend className="mb-2 font-medium">Color</legend>
            <div className="flex flex-wrap gap-2">
              {COLORES.map((c) => (
                <label key={c.valor} className="cursor-pointer">
                  <input type="radio" name="color" value={c.valor} checked={b.color === c.valor} onChange={() => setB({ ...b, color: c.valor })} className="peer sr-only" />
                  <span className="grid h-11 w-11 place-items-center rounded-full text-white ring-offset-2 ring-offset-tarjeta peer-checked:ring-4 peer-checked:ring-texto peer-focus-visible:outline-3" style={{ background: c.valor }} title={c.nombre}>
                    {b.color === c.valor && <Check size={20} aria-hidden="true" />}
                    <span className="sr-only">{c.nombre}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-medium">Ícono</legend>
            <div className="grid grid-cols-6 gap-2">
              {ICONOS.map((i) => (
                <label key={i} className="cursor-pointer">
                  <input type="radio" name="icono" value={i} checked={b.icono === i} onChange={() => setB({ ...b, icono: i })} className="peer sr-only" />
                  <span className="grid h-11 place-items-center rounded-xl border border-borde peer-checked:border-2 peer-checked:border-primario peer-checked:bg-suave peer-focus-visible:outline-3">
                    <Icono nombre={i} size={22} /><span className="sr-only">{i}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && <p role="alert" className="text-peligro">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => dialogo.current?.close()} className="boton-secundario">Cancelar</button>
            <button disabled={pendiente} className="boton-primario">{pendiente ? "Guardando…" : "Guardar"}</button>
          </div>
        </form>
      </dialog>

      <dialog ref={confirmar} aria-labelledby="titulo-borrar" className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl bg-tarjeta p-6 text-texto backdrop:bg-black/50">
        <h2 id="titulo-borrar" className="mb-2 text-xl font-bold">¿Eliminar &quot;{aBorrar?.nombre}&quot;?</h2>
        <p className="mb-6 text-tenue">Se borrará el servicio y, más adelante, su avatar y todos sus datos. No se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => confirmar.current?.close()} className="boton-secundario">Cancelar</button>
          <button onClick={borrar} disabled={pendiente} className="boton bg-peligro text-white">Eliminar</button>
        </div>
      </dialog>
    </div>
  );
}
