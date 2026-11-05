import type { DatosAvatar } from "@/lib/avatar/esquema";
import { TarjetaGrafico } from "@/components/graficos/Tarjeta";
import { BarrasEdad } from "@/components/graficos/BarrasEdad";
import { DonaGenero } from "@/components/graficos/DonaGenero";
import { BarrasH } from "@/components/graficos/BarrasH";
import { BarraIngresos } from "@/components/graficos/BarraIngresos";
import { Redes } from "@/components/graficos/Redes";
import { Velocimetro } from "@/components/graficos/Velocimetro";
import { Ubicacion } from "./Ubicacion";

export function Demograficos({ d, color, confianza }: { d: DatosAvatar; color: string; confianza: number }) {
  const g = d.demografia;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <TarjetaGrafico titulo="Edad" subtitulo="Porcentaje por rango"
        tabla={{ columnas: ["Rango", "%"], filas: g.edad.map((e) => [e.rango, e.porcentaje]) }}>
        <BarrasEdad datos={g.edad} color={color} />
      </TarjetaGrafico>
      <TarjetaGrafico titulo="Género" tabla={{ columnas: ["Género", "%"], filas: g.genero.map((e) => [e.genero, e.porcentaje]) }}>
        <DonaGenero datos={g.genero} />
      </TarjetaGrafico>
      <TarjetaGrafico titulo="Nivel de confianza" subtitulo="Según la cantidad de datos reales">
        <Velocimetro valor={confianza} />
      </TarjetaGrafico>
      <TarjetaGrafico titulo="Ocupación" tabla={{ columnas: ["Ocupación", "%"], filas: g.ocupaciones.map((e) => [e.nombre, e.porcentaje]) }}>
        <BarrasH color={color} items={g.ocupaciones.map((o) => ({ etiqueta: o.nombre, valor: o.porcentaje }))} />
      </TarjetaGrafico>
      <TarjetaGrafico titulo="Ubicación" subtitulo="Ranking de países y ciudades"
        tabla={{ columnas: ["País", "Ciudad", "%"], filas: g.ubicaciones.map((e) => [e.pais, e.ciudad ?? "—", e.porcentaje]) }}>
        <Ubicacion datos={g.ubicaciones} color={color} />
      </TarjetaGrafico>
      <TarjetaGrafico titulo="Ingresos" tabla={{ columnas: ["Nivel", "%"], filas: g.ingresos.map((e) => [e.nivel, e.porcentaje]) }}>
        <BarraIngresos datos={g.ingresos} />
      </TarjetaGrafico>
      <TarjetaGrafico titulo="Redes donde pasa su tiempo" subtitulo="% que usa cada red" className="md:col-span-2 xl:col-span-3">
        <Redes datos={g.redes} />
      </TarjetaGrafico>
    </div>
  );
}
