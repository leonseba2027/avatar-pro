"use client";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

type Tema = "claro" | "oscuro" | "sistema";

export function aplicarTema(t: Tema) {
  const oscuro = t === "oscuro" || (t === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", oscuro);
}

export function TemaToggle() {
  const [tema, setTema] = useState<Tema>("sistema");
  useEffect(() => {
    try { setTema((localStorage.getItem("tema") as Tema) || "sistema"); } catch {}
  }, []);
  const elegir = (t: Tema) => {
    setTema(t);
    try { localStorage.setItem("tema", t); } catch {}
    aplicarTema(t);
  };
  const ops = [
    { v: "claro" as const, l: "Claro", I: Sun },
    { v: "oscuro" as const, l: "Oscuro", I: Moon },
    { v: "sistema" as const, l: "Automático", I: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="Tema de la app" className="inline-flex rounded-xl border border-borde p-1 gap-1">
      {ops.map(({ v, l, I }) => (
        <button key={v} role="radio" aria-checked={tema === v} onClick={() => elegir(v)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm ${tema === v ? "bg-primario text-white" : "hover:bg-suave"}`}>
          <I size={16} aria-hidden="true" /> {l}
        </button>
      ))}
    </div>
  );
}
