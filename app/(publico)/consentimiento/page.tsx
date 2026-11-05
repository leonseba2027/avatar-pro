import Link from "next/link";
import { aceptarConsentimiento } from "./actions";

export const metadata = { title: "Consentimiento" };

export default async function Consentimiento({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main id="contenido" className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Antes de seguir</h1>
      <p className="mb-6 text-tenue">Necesitamos tu consentimiento para usar Avatar Pro. Podés revocarlo cuando quieras desde Configuración.</p>
      <form action={aceptarConsentimiento} className="space-y-4">
        <fieldset className="space-y-3 rounded-xl border border-borde p-4">
          <legend className="px-1 text-sm font-semibold">Tu consentimiento</legend>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="terminos" required className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Leí y acepto los <Link href="/terminos" target="_blank" className="underline">Términos y Condiciones</Link> y la <Link href="/privacidad" target="_blank" className="underline">Política de Privacidad</Link>. <span className="text-peligro">(obligatorio)</span></span></label>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="transferencia" required className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Acepto que mis datos se alojen en <strong>Supabase</strong> (Brasil/EE. UU.) y que el texto que cargue se procese con la <strong>API de Claude de Anthropic</strong> (EE. UU.). <span className="text-peligro">(obligatorio)</span></span></label>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="comunicaciones" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Quiero recibir avisos y novedades por email. <span className="text-tenue">(opcional)</span></span></label>
        </fieldset>
        {error && <p role="alert" className="text-peligro">Tenés que aceptar las dos casillas obligatorias.</p>}
        <button className="boton-primario w-full">Aceptar y continuar</button>
      </form>
      <form action="/auth/salir" method="post" className="mt-4 text-center">
        <button className="underline text-tenue">No acepto, cerrar sesión</button>
      </form>
    </main>
  );
}
