"use client";
import { useRef, useState } from "react";
import { FileDown, ImageDown, Frown, Smile } from "lucide-react";
import type { DatosAvatar } from "@/lib/avatar/esquema";
import { resumenAvatar } from "@/lib/avatar/resumen";
import { Ilustracion } from "./Ilustracion";
import { CATEGORICOS, ESTADO, ORDINAL } from "@/components/graficos/tema";

// Ficha de una página, siempre en tema claro para imprimir y compartir
const GEN: Record<string, string> = { mujer: "Mujeres", hombre: "Hombres", otro: "Otro" };

export function Infografia({ d, servicio, color, confianza, semilla }: { d: DatosAvatar; servicio: string; color: string; confianza: number; semilla: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState("");
  const r = resumenAvatar(d);
  const archivo = `avatar-${servicio.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-")}`;

  async function capturar(formato: "png" | "jpeg" = "png") {
    const { toPng, toJpeg } = await import("html-to-image");
    const op = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true };
    return formato === "png" ? toPng(ref.current!, op) : toJpeg(ref.current!, { ...op, quality: 0.9 });
  }
  async function png() {
    setEstado("Generando imagen…");
    const url = await capturar();
    const a = document.createElement("a"); a.href = url; a.download = `${archivo}.png`; a.click();
    setEstado("Imagen descargada.");
  }
  async function pdf() {
    setEstado("Generando PDF…");
    const [{ jsPDF }, url] = await Promise.all([import("jspdf"), capturar("jpeg")]);
    const img = new Image(); img.src = url; await img.decode();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const W = 210, H = 297, m = 8;
    const esc = Math.min((W - 2 * m) / img.width, (H - 2 * m) / img.height);
    const w = img.width * esc, h = img.height * esc;
    doc.addImage(url, "JPEG", (W - w) / 2, m, w, h, undefined, "FAST");
    doc.save(`${archivo}.pdf`);
    setEstado("PDF descargado.");
  }

  const gradGenero = (() => {
    let acc = 0;
    return `conic-gradient(${d.demografia.genero.map((g, i) => { const s = acc; acc += g.porcentaje; return `${CATEGORICOS.claro[i]} ${s}% ${acc}%`; }).join(", ")})`;
  })();
  const maxEdad = Math.max(...d.demografia.edad.map((e) => e.porcentaje), 1);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={pdf} className="boton-primario"><FileDown size={20} aria-hidden="true" /> Descargar PDF</button>
        <button onClick={png} className="boton-secundario"><ImageDown size={20} aria-hidden="true" /> Descargar imagen</button>
        <p role="status" aria-live="polite" className="text-tenue">{estado}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-borde">
        <div ref={ref} className="w-[900px] bg-white p-8 text-[#111827]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          <header className="mb-6 flex items-center gap-5 rounded-2xl p-5 text-white" style={{ background: color }}>
            <div className="rounded-full bg-white p-1"><Ilustracion semilla={semilla} tamano={96} titulo={d.nombre_ficticio} /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Avatar de cliente ideal · {servicio}</p>
              <h1 className="text-3xl font-bold">{d.nombre_ficticio}</h1>
              <p className="opacity-95">{d.resumen}</p>
            </div>
            <div className="text-center"><p className="text-4xl font-bold">{confianza}</p><p className="text-xs">confianza /100</p></div>
          </header>

          <div className="mb-5 grid grid-cols-4 gap-3 text-center">
            {[["Edad promedio", r.edadPromedio], ["Género", r.genero], ["País principal", r.pais], ["Ingresos", { bajo: "Bajo", medio: "Medio", alto: "Alto" }[[...d.demografia.ingresos].sort((a, b) => b.porcentaje - a.porcentaje)[0].nivel]]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[#f3f4f8] p-3"><p className="text-xs text-[#4b5563]">{k}</p><p className="text-lg font-bold">{v}</p></div>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-3 gap-4">
            <section className="rounded-xl border border-[#e5e7eb] p-4">
              <h2 className="mb-2 font-bold">Edad</h2>
              <div className="flex h-28 items-end gap-2">
                {d.demografia.edad.map((e) => (
                  <div key={e.rango} className="flex flex-1 flex-col items-center justify-end">
                    <span className="text-xs font-semibold">{e.porcentaje}%</span>
                    <div className="w-5 rounded-t" style={{ height: `${(e.porcentaje / maxEdad) * 80}px`, background: color }} />
                    <span className="mt-1 text-[10px] text-[#4b5563]">{e.rango}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-[#e5e7eb] p-4">
              <h2 className="mb-2 font-bold">Género</h2>
              <div className="flex items-center gap-3">
                <div className="h-24 w-24 shrink-0 rounded-full" style={{ background: gradGenero, WebkitMask: "radial-gradient(circle, transparent 55%, #000 56%)", mask: "radial-gradient(circle, transparent 55%, #000 56%)" }} />
                <ul className="text-sm">{d.demografia.genero.map((g, i) => <li key={g.genero} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: CATEGORICOS.claro[i] }} />{GEN[g.genero]} <b>{g.porcentaje}%</b></li>)}</ul>
              </div>
            </section>
            <section className="rounded-xl border border-[#e5e7eb] p-4">
              <h2 className="mb-2 font-bold">Ingresos</h2>
              <div className="flex h-6 gap-[2px] overflow-hidden rounded">{d.demografia.ingresos.map((x, i) => <div key={x.nivel} style={{ width: `${x.porcentaje}%`, background: ORDINAL.claro[i] }} />)}</div>
              <ul className="mt-2 flex justify-between text-xs">{d.demografia.ingresos.map((x) => <li key={x.nivel} className="capitalize">{x.nivel} <b>{x.porcentaje}%</b></li>)}</ul>
              <h2 className="mb-1 mt-3 font-bold">Redes</h2>
              <p className="text-xs">{d.demografia.redes.slice(0, 4).map((x) => `${x.red} ${x.porcentaje}%`).join(" · ")}</p>
            </section>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <Bloque titulo="Miedos principales">{d.mundo_interno.miedos.slice(0, 4).map((x) => <Barra key={x.texto} t={x.texto} v={x.intensidad} color={color} />)}</Bloque>
            <Bloque titulo="Mayores deseos">{d.metas.deseos.slice(0, 4).map((x) => <Barra key={x.texto} t={x.texto} v={x.prioridad} color={color} />)}</Bloque>
          </div>

          <section className="mb-5 grid grid-cols-3 gap-3">
            {d.mundo_interno.dice.slice(0, 3).map((f) => <p key={f} className="rounded-2xl rounded-bl-sm bg-[#f3f4f8] px-4 py-3 text-sm">“{f}”</p>)}
          </section>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl border-2 p-4" style={{ borderColor: ESTADO.bueno, background: "#f0fdf4" }}>
              <h2 className="mb-2 flex items-center gap-2 font-bold"><Smile size={20} color="#047857" /> Si lo logra</h2>
              <p className="text-sm">{d.emociones.si_logra.map((e) => e.emocion).join(" · ")}</p>
            </div>
            <div className="rounded-xl border-2 p-4" style={{ borderColor: ESTADO.critico, background: "#fef2f2" }}>
              <h2 className="mb-2 flex items-center gap-2 font-bold"><Frown size={20} color="#b91c1c" /> Si no lo logra</h2>
              <p className="text-sm">{d.emociones.si_no_logra.map((e) => e.emocion).join(" · ")}</p>
            </div>
          </div>

          <section className="mb-5 grid grid-cols-3 gap-2 text-sm">
            {[["Hoy", d.camino.hoy], ["Le falta", d.camino.falta], ["Quiere llegar", d.camino.quiere_llegar]].map(([k, v], i) => (
              <div key={k} className="rounded-xl border-2 p-3" style={{ borderColor: color }}><p className="text-xs font-bold text-[#4b5563]">{i + 1}. {k} {i < 2 && "→"}</p><p>{v}</p></div>
            ))}
          </section>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Bloque titulo="Objeciones"><ul className="list-disc pl-4">{d.marketing.objeciones.slice(0, 4).map((x) => <li key={x}>{x}</li>)}</ul></Bloque>
            <Bloque titulo="Palabras y ganchos"><p className="mb-2">{d.marketing.palabras.slice(0, 8).join(" · ")}</p><p className="italic">“{d.marketing.ganchos[0]}”</p></Bloque>
          </div>
          <p className="mt-5 text-center text-[10px] text-[#6b7280]">Avatar ficticio y general generado con Avatar Pro. No representa a ninguna persona real.</p>
        </div>
      </div>
    </div>
  );
}

const Bloque = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-[#e5e7eb] p-4"><h2 className="mb-2 font-bold">{titulo}</h2>{children}</section>
);
const Barra = ({ t, v, color }: { t: string; v: number; color: string }) => (
  <div className="mb-2"><p className="text-sm leading-tight">{t}</p>
    <div className="flex items-center gap-2"><div className="h-2.5 flex-1 rounded-r bg-[#eef0f6]"><div className="h-2.5 rounded-r" style={{ width: `${v * 10}%`, background: color }} /></div><b className="w-9 text-right text-xs">{v}/10</b></div></div>
);
