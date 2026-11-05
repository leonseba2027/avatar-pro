"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const sitio = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${sitio}/auth/callback?next=/nueva-clave` });
    setEnviado(true); // Siempre el mismo mensaje: no revela si el email existe
  }
  return (
    <main id="contenido" className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-4 text-2xl font-bold">Recuperar contraseña</h1>
      {enviado ? (
        <p role="status" className="tarjeta">Si existe una cuenta con ese email, te enviamos un enlace para crear una contraseña nueva.</p>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <label htmlFor="email" className="block font-medium">Email</label>
          <input id="email" type="email" required className="campo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="boton-primario w-full">Enviar enlace</button>
        </form>
      )}
      <p className="mt-6"><Link href="/login" className="underline">Volver</Link></p>
    </main>
  );
}
