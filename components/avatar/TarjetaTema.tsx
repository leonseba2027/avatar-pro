"use client";
import { useState } from "react";
import { Brain, ClipboardList, Magnet, Puzzle, ShieldQuestion } from "lucide-react";

const ICONOS = { brain: Brain, clipboard: ClipboardList, magnet: Magnet, puzzle: Puzzle, shield: ShieldQuestion };

// Tarjeta por tema: ícono + color, 3 puntos visibles y "ver más"
export function TarjetaTema({ titulo, icono, tono, items, visibles = 3 }: { titulo: string; icono: keyof typeof ICONOS; tono: string; items: string[]; visibles?: number }) {
  const Icono = ICONOS[icono];
  const [abierto, setAbierto] = useState(false);
  const lista = abierto ? items : items.slice(0, visibles);
  return (
    <section className="tarjeta" aria-label={titulo}>
      <h3 className="mb-3 flex items-center gap-3 text-lg font-semibold">
        <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: tono }}><Icono size={22} aria-hidden="true" /></span>
        {titulo}
      </h3>
      <ul className="space-y-2">
        {lista.map((x, i) => (
          <li key={i} className="flex gap-2 leading-snug"><span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: tono }} aria-hidden="true" />{x}</li>
        ))}
      </ul>
      {items.length > visibles && (
        <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="mt-3 text-sm font-semibold text-primario underline">
          {abierto ? "Ver menos" : `Ver más (${items.length - visibles})`}
        </button>
      )}
    </section>
  );
}
