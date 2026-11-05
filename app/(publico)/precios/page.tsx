import Link from "next/link";
import { PieLegal } from "@/components/PieLegal";
import { PLANES, ivaContenido, pesos, ALICUOTA_IVA } from "@/lib/precios";

export const metadata = { title: "Precios" };

export default function Precios() {
  return (
    <>
      <main id="contenido" className="mx-auto max-w-4xl px-4 py-10">
        <p className="mb-6"><Link href="/" className="underline">← Volver a Avatar Pro</Link></p>
        <h1 className="mb-2 text-3xl font-bold">Precios</h1>
        <p className="mb-8 text-tenue">Precios <strong>finales en pesos argentinos</strong>, con todos los impuestos incluidos. Podés arrepentirte dentro de los 10 días y darte de baja cuando quieras, desde la app o desde el <Link href="/arrepentimiento" className="underline">Botón de arrepentimiento</Link>.</p>
        <ul className="grid gap-4 md:grid-cols-2">
          {PLANES.map((p) => (
            <li key={p.id} className="tarjeta">
              <h2 className="text-2xl font-bold">{p.nombre}</h2>
              {p.completar && <p className="mt-1 rounded-lg bg-amber-100 px-2 py-1 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">[COMPLETAR: precio real en lib/precios.ts]</p>}
              <p className="mt-3"><span className="text-4xl font-bold">{pesos(p.precioFinalARS)}</span> <span className="text-tenue">por {p.periodo}</span></p>
              <p className="text-sm text-tenue">Precio final. IVA contenido ({ALICUOTA_IVA * 100}%): {pesos(ivaContenido(p.precioFinalARS))}. Otros impuestos nacionales indirectos: [COMPLETAR o $0,00].</p>
              <ul className="mt-4 list-disc space-y-1 pl-5">{p.detalle.map((d) => <li key={d}>{d}</li>)}</ul>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-tenue">La suscripción se renueva automáticamente cada período hasta que la des de baja. Avisamos cualquier cambio de precio con 30 días de anticipación. Ver <Link href="/terminos" className="underline">Términos y Condiciones</Link>.</p>
      </main>
      <PieLegal />
    </>
  );
}
