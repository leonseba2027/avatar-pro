"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Aviso informativo: solo se usan cookies necesarias, por eso no hace falta aceptar ni rechazar
export function AvisoCookies() {
  const [ver, setVer] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem("aviso-cookies")) setVer(true); } catch {} }, []);
  if (!ver) return null;
  const cerrar = () => { try { localStorage.setItem("aviso-cookies", "1"); } catch {} setVer(false); };
  return (
    <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-xl rounded-2xl border border-borde bg-tarjeta p-4 shadow-lg md:bottom-4 print:hidden">
      <p className="text-sm">Usamos solo cookies <strong>necesarias</strong> para mantener tu sesión y recordar tus preferencias. No usamos publicidad ni rastreo. <Link href="/cookies" className="underline">Más información</Link></p>
      <button onClick={cerrar} className="boton-primario mt-3 py-2 text-sm">Entendido</button>
    </div>
  );
}
