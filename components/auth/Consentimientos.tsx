"use client";
import Link from "next/link";

export type Consent = { terminos: boolean; transferencia: boolean; comunicaciones: boolean };

// Casillas SIN marcar por defecto (Ley 25.326, consentimiento expreso)
export function Consentimientos({ valor, onChange }: { valor: Consent; onChange: (c: Consent) => void }) {
  const item = (k: keyof Consent, texto: React.ReactNode, obligatorio: boolean) => (
    <label className="flex items-start gap-3 text-sm leading-snug">
      <input type="checkbox" checked={valor[k]} onChange={(e) => onChange({ ...valor, [k]: e.target.checked })}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primario)]" required={obligatorio} aria-required={obligatorio} />
      <span>{texto} {obligatorio ? <span className="text-peligro">(obligatorio)</span> : <span className="text-tenue">(opcional)</span>}</span>
    </label>
  );
  return (
    <fieldset className="space-y-3 rounded-xl border border-borde p-4">
      <legend className="px-1 text-sm font-semibold">Tu consentimiento</legend>
      {item("terminos", <>Leí y acepto los <Link href="/terminos" target="_blank" className="underline">Términos y Condiciones</Link> y la <Link href="/privacidad" target="_blank" className="underline">Política de Privacidad</Link>.</>, true)}
      {item("transferencia", <>Acepto que mis datos se alojen en servidores de <strong>Supabase</strong> (Brasil/EE. UU.) y que el texto que cargue se procese con la <strong>API de Claude de Anthropic</strong> (EE. UU.), países que pueden no tener un nivel de protección equivalente al argentino.</>, true)}
      {item("comunicaciones", <>Quiero recibir avisos y novedades por email. Puedo darme de baja cuando quiera.</>, false)}
    </fieldset>
  );
}

export const consentCompleto = (c: Consent) => c.terminos && c.transferencia;
