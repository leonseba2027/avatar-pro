import { ArrowDown, ArrowRight, Flag, Frown, MapPin, Puzzle, Smile, Sparkles, Zap } from "lucide-react";
import type { DatosAvatar } from "@/lib/avatar/esquema";
import { TarjetaGrafico } from "@/components/graficos/Tarjeta";
import { BarrasH } from "@/components/graficos/BarrasH";
import { TarjetaTema } from "./TarjetaTema";

// Colores de tema con contraste AA para texto blanco sobre el ícono
const TONO = { piensa: "#6d28d9", exige: "#0369a1", falta: "#b45309", objeciones: "#9f1239", palabras: "#047857", ganchos: "#be185d" };

export function MundoInterno({ d, color }: { d: DatosAvatar; color: string }) {
  const m = d.mundo_interno;
  return (
    <div className="space-y-6">
      {/* Camino del avatar */}
      <section className="tarjeta" aria-label="Camino del avatar">
        <h3 className="mb-4 text-lg font-semibold">Camino del avatar</h3>
        <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          {[
            { t: "Dónde está hoy", v: d.camino.hoy, I: MapPin },
            { t: "Qué le falta", v: d.camino.falta, I: Puzzle },
            { t: "Dónde quiere llegar", v: d.camino.quiere_llegar, I: Flag },
          ].map((p, i) => (
            <li key={p.t} className="contents">
              {i > 0 && <span className="self-center text-tenue" aria-hidden="true"><ArrowDown className="md:hidden" /><ArrowRight className="hidden md:block" /></span>}
              <div className="flex-1 rounded-xl border-2 p-4" style={{ borderColor: color }}>
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-tenue"><p.I size={18} aria-hidden="true" /> {i + 1}. {p.t}</p>
                <p className="font-medium leading-snug">{p.v}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Qué dice */}
      <section className="tarjeta" aria-label="Qué dice">
        <h3 className="mb-4 text-lg font-semibold">Qué dice</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {m.dice.map((f, i) => (
            <li key={i} className={`relative max-w-md rounded-2xl bg-suave px-4 py-3 text-[1.05rem] leading-snug ${i % 2 ? "sm:justify-self-end rounded-br-sm" : "rounded-bl-sm"}`}>
              <span className="sr-only">Frase: </span>“{f}”
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <TarjetaGrafico titulo="Miedos y temores" subtitulo="Intensidad del 1 al 10"
          tabla={{ columnas: ["Miedo", "Intensidad"], filas: m.miedos.map((x) => [x.texto, x.intensidad]) }}>
          <BarrasH color={color} max={10} sufijo="/10" items={m.miedos.map((x) => ({ etiqueta: x.texto, valor: x.intensidad }))} />
          <p className="mt-4 rounded-xl border-l-4 border-peligro bg-suave p-3 text-sm"><Zap size={16} className="mr-1 inline text-peligro" aria-hidden="true" /><strong>Peor escenario:</strong> {m.peor_escenario}</p>
        </TarjetaGrafico>
        <TarjetaGrafico titulo="Ansiedades" subtitulo="Intensidad del 1 al 10"
          tabla={{ columnas: ["Ansiedad", "Intensidad"], filas: m.ansiedades.map((x) => [x.texto, x.intensidad]) }}>
          <BarrasH color={color} max={10} sufijo="/10" items={m.ansiedades.map((x) => ({ etiqueta: x.texto, valor: x.intensidad }))} />
        </TarjetaGrafico>
        <TarjetaGrafico titulo="Mayores deseos" subtitulo="Prioridad del 1 al 10"
          tabla={{ columnas: ["Deseo", "Prioridad"], filas: d.metas.deseos.map((x) => [x.texto, x.prioridad]) }}>
          <BarrasH color={color} max={10} sufijo="/10" items={d.metas.deseos.map((x) => ({ etiqueta: x.texto, valor: x.prioridad }))} />
        </TarjetaGrafico>
        <TarjetaTema titulo="Qué piensa" icono="brain" tono={TONO.piensa} items={m.piensa} />
      </div>

      {/* Si lo logra vs si no lo logra */}
      <section aria-label="Emociones del resultado" className="grid gap-4 md:grid-cols-2">
        {[
          { t: "Si lo logra", items: d.emociones.si_logra, I: Smile, clase: "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40", ic: "text-emerald-700 dark:text-emerald-400" },
          { t: "Si no lo logra", items: d.emociones.si_no_logra, I: Frown, clase: "border-red-600 bg-red-50 dark:bg-red-950/40", ic: "text-red-700 dark:text-red-400" },
        ].map((c) => (
          <div key={c.t} className={`rounded-2xl border-2 p-5 ${c.clase}`}>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><c.I size={28} className={c.ic} aria-hidden="true" /> {c.t}</h3>
            <ul className="space-y-3">
              {c.items.map((e, i) => <li key={i}><strong className="block">{e.emocion}</strong><span className="text-tenue">{e.descripcion}</span></li>)}
            </ul>
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TarjetaTema titulo="Qué le exigen hoy" icono="clipboard" tono={TONO.exige} items={d.metas.le_exigen} />
        <TarjetaTema titulo="Qué le falta" icono="puzzle" tono={TONO.falta} items={d.metas.le_falta} />
        <TarjetaTema titulo="Objeciones antes de comprar" icono="shield" tono={TONO.objeciones} items={d.marketing.objeciones} />
        <TarjetaTema titulo="Ganchos que le atraen" icono="magnet" tono={TONO.ganchos} items={d.marketing.ganchos} />
        <section className="tarjeta md:col-span-2" aria-label="Palabras que le atraen">
          <h3 className="mb-3 flex items-center gap-3 text-lg font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: TONO.palabras }}><Sparkles size={22} aria-hidden="true" /></span>
            Palabras que le atraen
          </h3>
          <ul className="flex flex-wrap gap-2">{d.marketing.palabras.map((p) => <li key={p} className="rounded-full bg-suave px-3 py-1.5 font-medium">{p}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
