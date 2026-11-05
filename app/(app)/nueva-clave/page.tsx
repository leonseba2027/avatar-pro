"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NuevaClave() {
  const router = useRouter();
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().auth.updateUser({ password: clave });
    if (error) setError("No se pudo cambiar la contraseña. Probá con otra de al menos 8 caracteres.");
    else router.replace("/inicio");
  }
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Nueva contraseña</h1>
      <form onSubmit={enviar} className="space-y-4">
        <label htmlFor="clave" className="block font-medium">Contraseña nueva</label>
        <input id="clave" type="password" minLength={8} required className="campo" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="new-password" />
        {error && <p role="alert" className="text-peligro">{error}</p>}
        <button className="boton-primario w-full">Guardar</button>
      </form>
    </div>
  );
}
