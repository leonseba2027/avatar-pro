"use client";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function FormularioTramite() {
  const [tipo, setTipo] = useState<"arrepentimiento" | "baja">("arrepentimiento");
  const [res, setRes] = useState<{ codigo?: string; error?: string; enviando?: boolean; creado?: string } | null>(null);
  useEffect(() => { if (new URLSearchParams(location.search).get("tipo") === "baja") setTipo("baja"); }, []);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setRes({ enviando: true });
    const r = await fetch("/api/tramite", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, email: fd.get("email"), fecha_contratacion: fd.get("fecha") || "", detalle: fd.get("detalle") || "", web: fd.get("web") || "" }) }).catch(() => null);
    const j = await r?.json().catch(() => ({}));
    setRes(r?.ok ? { codigo: j.codigo, creado: j.creado } : { error: j?.error ?? "No se pudo enviar. Revisá tu conexión." });
  }

  if (res?.codigo) return (
    <div role="status" className="tarjeta mt-6 text-center">
      <CheckCircle2 size={48} className="mx-auto mb-2 text-exito" aria-hidden="true" />
      <h2 className="text-xl font-bold">Recibimos tu solicitud de {tipo === "baja" ? "baja" : "arrepentimiento"}</h2>
      <p className="mt-2">Tu código de trámite es:</p>
      <p className="my-2 select-all text-3xl font-bold tracking-wider">{res.codigo}</p>
      <p className="text-sm text-tenue">Fecha: {new Date(res.creado!).toLocaleString("es-AR")}. Guardá este código (sacale una captura). Te escribimos dentro de las 24 horas hábiles.</p>
    </div>
  );

  return (
    <form onSubmit={enviar} className="tarjeta mt-6 space-y-4">
      <fieldset>
        <legend className="mb-2 font-semibold">¿Qué querés hacer?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {([["arrepentimiento", "Arrepentirme de la compra", "Dentro de los 10 días: devolución total"], ["baja", "Dar de baja el servicio", "Dejan de cobrarse los próximos períodos"]] as const).map(([v, t, d]) => (
            <label key={v} className={`cursor-pointer rounded-xl border-2 p-3 ${tipo === v ? "border-primario bg-suave" : "border-borde"}`}>
              <input type="radio" name="tipo" className="mr-2" checked={tipo === v} onChange={() => setTipo(v)} />
              <strong>{t}</strong><span className="block text-sm text-tenue">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div><label htmlFor="t-email" className="mb-1 block font-medium">Email con el que contrataste</label>
        <input id="t-email" name="email" type="email" required className="campo" autoComplete="email" /></div>
      <div><label htmlFor="t-fecha" className="mb-1 block font-medium">Fecha de contratación <span className="text-tenue">(opcional)</span></label>
        <input id="t-fecha" name="fecha" type="date" className="campo" /></div>
      <div><label htmlFor="t-det" className="mb-1 block font-medium">Comentario <span className="text-tenue">(opcional, no es necesario dar motivos)</span></label>
        <textarea id="t-det" name="detalle" rows={2} maxLength={1000} className="campo" /></div>
      <div aria-hidden="true" className="absolute -left-[9999px]"><label>No completar<input name="web" tabIndex={-1} autoComplete="off" /></label></div>
      {res?.error && <p role="alert" className="text-peligro">{res.error}</p>}
      <button disabled={res?.enviando} className="boton-primario w-full">{res?.enviando ? "Enviando…" : tipo === "baja" ? "Solicitar la baja" : "Me arrepiento de la compra"}</button>
    </form>
  );
}
