"use client";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { DEMOGRAFIA } from "@/lib/encuesta/plantilla";

declare global { interface Window { turnstile?: { getResponse: () => string | undefined; reset: () => void } } }

export function FormularioEncuesta({ slug, preguntas, demografia, turnstileKey, titular }: {
  slug: string; preguntas: { id: string; texto: string }[]; demografia: boolean; turnstileKey: string | null; titular: string;
}) {
  const [demo, setDemo] = useState<Record<string, string | string[]>>({ redes: [] });
  const [abiertas, setAbiertas] = useState<Record<string, string>>({});
  const [consentimiento, setConsentimiento] = useState(false);
  const [estado, setEstado] = useState<{ tipo: "enviando" | "ok" | "error"; texto?: string } | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consentimiento) return setEstado({ tipo: "error", texto: "Para enviar tenés que aceptar el consentimiento." });
    setEstado({ tipo: "enviando" });
    const web = (new FormData(e.currentTarget).get("web") as string) ?? "";
    const r = await fetch(`/api/encuesta/${slug}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consentimiento, web, turnstile: window.turnstile?.getResponse(), demografia: demografia ? demo : undefined, abiertas }),
    }).catch(() => null);
    const j = await r?.json().catch(() => ({}));
    if (r?.ok) setEstado({ tipo: "ok" });
    else { setEstado({ tipo: "error", texto: j?.error ?? "No se pudo enviar. Revisá tu conexión." }); window.turnstile?.reset(); }
  }

  if (estado?.tipo === "ok") return (
    <div role="status" className="tarjeta text-center">
      <CheckCircle2 size={48} className="mx-auto mb-3 text-exito" aria-hidden="true" />
      <h2 className="text-2xl font-bold">¡Gracias por responder!</h2>
      <p className="text-tenue">Tus respuestas son anónimas y nos ayudan a mejorar.</p>
    </div>
  );

  return (
    <form onSubmit={enviar} className="space-y-6">
      <p className="flex items-start gap-2 rounded-xl bg-suave p-3 text-sm"><ShieldCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>Es anónima: no pedimos tu nombre, email ni teléfono. <strong>No escribas datos personales</strong> ni información sobre salud, religión, política, origen étnico o vida sexual.</span></p>

      {/* Trampa para robots (invisible para personas y lectores de pantalla) */}
      <div aria-hidden="true" className="absolute -left-[9999px]"><label>No completar<input name="web" tabIndex={-1} autoComplete="off" /></label></div>

      {demografia && (
        <fieldset className="tarjeta space-y-4">
          <legend className="px-1 text-lg font-semibold">Sobre vos (opcional)</legend>
          {(["edad", "genero", "pais", "ocupacion", "ingresos"] as const).map((k) => (
            <div key={k}>
              <label htmlFor={`d-${k}`} className="mb-1 block font-medium">{DEMOGRAFIA[k].etiqueta}</label>
              <select id={`d-${k}`} className="campo" value={(demo[k] as string) ?? ""} onChange={(e) => setDemo({ ...demo, [k]: e.target.value || undefined } as Record<string, string>)}>
                <option value="">Elegí una opción</option>
                {DEMOGRAFIA[k].opciones.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <fieldset>
            <legend className="mb-2 font-medium">{DEMOGRAFIA.redes.etiqueta}</legend>
            <div className="flex flex-wrap gap-2">
              {DEMOGRAFIA.redes.opciones.map((o) => {
                const sel = (demo.redes as string[]).includes(o);
                return (
                  <label key={o} className={`cursor-pointer rounded-full border-2 px-3 py-1.5 ${sel ? "border-primario bg-suave font-semibold" : "border-borde"}`}>
                    <input type="checkbox" className="sr-only" checked={sel} onChange={() => setDemo({ ...demo, redes: sel ? (demo.redes as string[]).filter((x) => x !== o) : [...(demo.redes as string[]), o] })} />
                    {sel ? "✓ " : ""}{o}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </fieldset>
      )}

      {preguntas.map((q, i) => (
        <div key={q.id}>
          <label htmlFor={q.id} className="mb-1 block text-lg font-medium">{i + 1}. {q.texto}</label>
          <textarea id={q.id} rows={3} maxLength={1500} className="campo" value={abiertas[q.id] ?? ""} onChange={(e) => setAbiertas({ ...abiertas, [q.id]: e.target.value })} />
        </div>
      ))}

      {turnstileKey && (<><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer /><div className="cf-turnstile" data-sitekey={turnstileKey} data-language="es" /></>)}

      <label className="flex items-start gap-3 rounded-xl border border-borde p-4 text-sm leading-snug">
        <input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} required className="mt-0.5 h-5 w-5 shrink-0" />
        <span>Acepto participar de forma anónima y voluntaria. Entiendo que mis respuestas se usan solo para crear perfiles generales de cliente (nunca para identificarme), que se guardan en servidores de Supabase (Brasil/EE. UU.) y se analizan con la IA de Anthropic (EE. UU.), y que se borran a los 12 meses. Plataforma: Avatar Pro ({titular}). <Link href="/privacidad" target="_blank" className="underline">Política de privacidad</Link>. <span className="text-peligro">(obligatorio)</span></span>
      </label>

      {estado?.tipo === "error" && <p role="alert" className="text-peligro">{estado.texto}</p>}
      <button disabled={estado?.tipo === "enviando"} className="boton-primario w-full text-lg">{estado?.tipo === "enviando" ? "Enviando…" : "Enviar respuestas"}</button>
    </form>
  );
}
