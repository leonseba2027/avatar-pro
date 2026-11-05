import Link from "next/link";
import { LEYENDA_AAIP, TITULAR } from "@/lib/legal";

export function PieLegal() {
  return (
    <footer className="mt-12 border-t border-borde px-4 py-6 text-xs text-tenue space-y-3">
      <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/arrepentimiento" className="font-semibold text-primario underline">Botón de arrepentimiento</Link>
        <Link href="/arrepentimiento?tipo=baja" className="underline">Baja del servicio</Link>
        <Link href="/precios" className="underline">Precios</Link>
        <Link href="/terminos" className="underline">Términos y condiciones</Link>
        <Link href="/privacidad" className="underline">Política de privacidad</Link>
        <Link href="/cookies" className="underline">Cookies</Link>
        <Link href="/accesibilidad" className="underline">Accesibilidad</Link>
      </nav>
      <p>{TITULAR.nombre} · CUIT {TITULAR.cuit} · {TITULAR.domicilio}</p>
      <p>{LEYENDA_AAIP}</p>
    </footer>
  );
}
