import type { DatosAvatar } from "@/lib/avatar/esquema";

// Vista provisoria de la Etapa 2. En la Etapa 3 se reemplaza por gráficos.
const Lista = ({ titulo, items }: { titulo: string; items: string[] }) => (
  <section className="tarjeta"><h3 className="mb-2 text-lg font-semibold">{titulo}</h3>
    <ul className="list-disc space-y-1 pl-5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
);
const Barras = ({ titulo, items, max = 100, sufijo = "%" }: { titulo: string; items: { t: string; v: number }[]; max?: number; sufijo?: string }) => (
  <section className="tarjeta"><h3 className="mb-3 text-lg font-semibold">{titulo}</h3>
    <ul className="space-y-2">{items.map((x, i) => (
      <li key={i}><div className="flex justify-between gap-2 text-sm"><span>{x.t}</span><span className="font-semibold">{x.v}{sufijo}</span></div>
        <div className="h-2.5 rounded-full bg-suave"><div className="h-2.5 rounded-full bg-primario" style={{ width: `${(x.v / max) * 100}%` }} /></div></li>
    ))}</ul></section>
);

export function Perfil({ d }: { d: DatosAvatar }) {
  const g = d.demografia;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Barras titulo="Edad" items={g.edad.map((e) => ({ t: e.rango, v: e.porcentaje }))} />
      <Barras titulo="Género" items={g.genero.map((e) => ({ t: e.genero, v: e.porcentaje }))} />
      <Barras titulo="Ocupación" items={g.ocupaciones.map((e) => ({ t: e.nombre, v: e.porcentaje }))} />
      <Barras titulo="Ubicación" items={g.ubicaciones.map((e) => ({ t: [e.ciudad, e.pais].filter(Boolean).join(", "), v: e.porcentaje }))} />
      <Barras titulo="Ingresos" items={g.ingresos.map((e) => ({ t: e.nivel, v: e.porcentaje }))} />
      <Barras titulo="Redes" items={g.redes.map((e) => ({ t: e.red, v: e.porcentaje }))} />
      <Lista titulo="Qué piensa" items={d.mundo_interno.piensa} />
      <Lista titulo="Qué dice" items={d.mundo_interno.dice.map((x) => `“${x}”`)} />
      <Barras titulo="Miedos" max={10} sufijo="/10" items={d.mundo_interno.miedos.map((e) => ({ t: e.texto, v: e.intensidad }))} />
      <Barras titulo="Ansiedades" max={10} sufijo="/10" items={d.mundo_interno.ansiedades.map((e) => ({ t: e.texto, v: e.intensidad }))} />
      <Lista titulo="Peor escenario" items={[d.mundo_interno.peor_escenario]} />
      <Barras titulo="Deseos" max={10} sufijo="/10" items={d.metas.deseos.map((e) => ({ t: e.texto, v: e.prioridad }))} />
      <Lista titulo="Qué le exigen hoy" items={d.metas.le_exigen} />
      <Lista titulo="Qué le falta" items={d.metas.le_falta} />
      <Lista titulo="Si lo logra" items={d.emociones.si_logra.map((e) => `${e.emocion}: ${e.descripcion}`)} />
      <Lista titulo="Si no lo logra" items={d.emociones.si_no_logra.map((e) => `${e.emocion}: ${e.descripcion}`)} />
      <Lista titulo="Camino" items={[`Hoy: ${d.camino.hoy}`, `Le falta: ${d.camino.falta}`, `Quiere llegar: ${d.camino.quiere_llegar}`]} />
      <Lista titulo="Objeciones" items={d.marketing.objeciones} />
      <Lista titulo="Palabras que le atraen" items={d.marketing.palabras} />
      <Lista titulo="Ganchos" items={d.marketing.ganchos} />
    </div>
  );
}
