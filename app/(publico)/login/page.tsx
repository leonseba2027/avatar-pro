"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Consentimientos, consentCompleto, type Consent } from "@/components/auth/Consentimientos";
import { VERSION_TEXTOS_LEGALES } from "@/lib/legal";
import { PieLegal } from "@/components/PieLegal";

const sitio = () => process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

export default function Login() {
  return <Suspense><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const desconectado = useSearchParams().get("desconectado");
  const supabase = createClient();
  const [modo, setModo] = useState<"ingresar" | "registro">("ingresar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [consent, setConsent] = useState<Consent>({ terminos: false, transferencia: false, comunicaciones: false });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "ok"; texto: string } | null>(null);

  const registro = modo === "registro";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    if (registro && !consentCompleto(consent)) {
      setMensaje({ tipo: "error", texto: "Para crear la cuenta tenés que aceptar las dos casillas obligatorias." });
      return;
    }
    setCargando(true);
    if (registro) {
      const { error } = await supabase.auth.signUp({
        email, password: clave,
        options: {
          emailRedirectTo: `${sitio()}/auth/callback`,
          data: {
            nombre, acepto_terminos: consent.terminos, acepto_transferencia: consent.transferencia,
            acepto_comunicaciones: consent.comunicaciones, version_textos_legales: VERSION_TEXTOS_LEGALES,
          },
        },
      });
      setMensaje(error
        ? { tipo: "error", texto: traducir(error.message) }
        : { tipo: "ok", texto: "¡Listo! Te enviamos un email para confirmar tu cuenta. Abrilo y tocá el enlace." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
      if (error) setMensaje({ tipo: "error", texto: traducir(error.message) });
      else { router.replace("/inicio"); router.refresh(); }
    }
    setCargando(false);
  }

  async function google() {
    if (registro && !consentCompleto(consent)) {
      setMensaje({ tipo: "error", texto: "Para crear la cuenta tenés que aceptar las dos casillas obligatorias." });
      return;
    }
    const c = registro ? `?c=${[consent.terminos && "t", consent.transferencia && "x", consent.comunicaciones && "m"].filter(Boolean).join("")}` : "";
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${sitio()}/auth/callback${c}` } });
  }

  return (
    <>
    <main id="contenido" className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <img src="/icons/icon.svg" alt="" width={64} height={64} className="mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Avatar Pro</h1>
        <p className="mt-1 text-tenue">Conocé a tu cliente ideal, servicio por servicio.</p>
      </div>

      {desconectado && <p role="status" className="mb-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">Este dispositivo fue desconectado. Volvé a ingresar si querés usarlo.</p>}
      <div role="tablist" aria-label="Acceso" className="mb-6 grid grid-cols-2 rounded-xl bg-suave p-1">
        {(["ingresar", "registro"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={modo === m} onClick={() => { setModo(m); setMensaje(null); }}
            className={`rounded-lg py-2.5 font-semibold ${modo === m ? "bg-tarjeta shadow" : "text-tenue"}`}>
            {m === "ingresar" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="space-y-4" noValidate={false}>
        {registro && (
          <div>
            <label htmlFor="nombre" className="mb-1 block font-medium">Tu nombre</label>
            <input id="nombre" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block font-medium">Email</label>
          <input id="email" type="email" required className="campo" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="clave" className="mb-1 block font-medium">Contraseña</label>
          <input id="clave" type="password" required minLength={8} className="campo" value={clave} onChange={(e) => setClave(e.target.value)}
            autoComplete={registro ? "new-password" : "current-password"} aria-describedby={registro ? "ayuda-clave" : undefined} />
          {registro && <p id="ayuda-clave" className="mt-1 text-sm text-tenue">Mínimo 8 caracteres.</p>}
        </div>

        {registro && <Consentimientos valor={consent} onChange={setConsent} />}

        {mensaje && (
          <p role={mensaje.tipo === "error" ? "alert" : "status"}
            className={`rounded-xl p-3 text-sm ${mensaje.tipo === "error" ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100" : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"}`}>
            {mensaje.texto}
          </p>
        )}

        <button type="submit" disabled={cargando} className="boton-primario w-full">
          {cargando ? "Un momento…" : registro ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-sm text-tenue"><hr className="flex-1 border-borde" />o<hr className="flex-1 border-borde" /></div>

      <button onClick={google} className="boton-secundario w-full">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        {registro ? "Crear cuenta con Google" : "Ingresar con Google"}
      </button>

      {!registro && <p className="mt-6 text-center"><Link href="/recuperar" className="underline">Olvidé mi contraseña</Link></p>}
    </main>
    <PieLegal />
    </>
  );
}

function traducir(m: string) {
  if (m.includes("Invalid login")) return "Email o contraseña incorrectos.";
  if (m.includes("Email not confirmed")) return "Todavía no confirmaste tu email. Revisá tu bandeja de entrada (y spam).";
  if (m.includes("already registered")) return "Ya existe una cuenta con ese email. Probá ingresar.";
  if (m.includes("Password should")) return "La contraseña es muy débil: usá al menos 8 caracteres.";
  if (m.includes("rate limit")) return "Demasiados intentos. Esperá unos minutos.";
  return "No pudimos completar la acción. Intentá de nuevo.";
}
