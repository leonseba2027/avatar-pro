import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Smartphone } from "lucide-react";
import { TemaToggle } from "@/components/TemaToggle";
import { PreferenciasIA } from "./PreferenciasIA";
import { Avisos } from "./Avisos";
import { MisDatos } from "./MisDatos";

export const metadata = { title: "Configuración" };

export default async function Configuracion() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", user!.id).single();
  const f = (d?: string | null) => (d ? new Date(d).toLocaleString("es-AR") : "No");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <section className="tarjeta space-y-3" aria-labelledby="t-apariencia">
        <h2 id="t-apariencia" className="text-xl font-semibold">Apariencia</h2>
        <TemaToggle />
      </section>
      <section className="tarjeta" aria-labelledby="t-avisos">
        <h2 id="t-avisos" className="mb-3 text-xl font-semibold">Avisos</h2>
        <Avisos prefs={{ avatar: true, encuesta: true, aprobacion: true, pocos_datos: true, ...(perfil?.notif ?? {}) }} />
      </section>
      <section className="tarjeta" aria-labelledby="t-seg">
        <h2 id="t-seg" className="mb-2 text-xl font-semibold">Seguridad</h2>
        <ul className="divide-y divide-borde">
          {[["/dispositivos", "Dispositivos conectados", Smartphone], ["/aprobaciones", "Historial de aprobaciones", ShieldCheck]].map(([href, t, I]) => {
            const Ic = I as typeof Smartphone;
            return <li key={href as string}><Link href={href as string} className="flex items-center gap-3 py-3 hover:underline"><Ic size={20} aria-hidden="true" /> {t as string}<ChevronRight size={18} className="ml-auto" aria-hidden="true" /></Link></li>;
          })}
        </ul>
      </section>
      <section className="tarjeta" aria-labelledby="t-ia">
        <h2 id="t-ia" className="mb-3 text-xl font-semibold">Inteligencia artificial</h2>
        <PreferenciasIA modelo={perfil?.modelo_ia ?? "opus"} reanalisis={perfil?.reanalisis_cada ?? 5} />
      </section>
      <section className="tarjeta space-y-2" aria-labelledby="t-cuenta">
        <h2 id="t-cuenta" className="text-xl font-semibold">Cuenta</h2>
        <p><span className="text-tenue">Email:</span> {user!.email}</p>
        <a href="/nueva-clave" className="underline">Cambiar contraseña</a>
      </section>
      <section className="tarjeta space-y-2" aria-labelledby="t-consent">
        <h2 id="t-consent" className="text-xl font-semibold">Mis consentimientos</h2>
        <ul className="space-y-1 text-sm">
          <li>Términos y privacidad: {f(perfil?.acepto_terminos_at)}</li>
          <li>Transferencia internacional: {f(perfil?.acepto_transferencia_at)}</li>
          <li>Comunicaciones por email: {f(perfil?.acepto_comunicaciones_at)}</li>
          <li className="text-tenue">Versión de textos: {perfil?.version_textos_legales ?? "—"}</li>
        </ul>
      </section>
      <section className="tarjeta space-y-3" aria-labelledby="t-datos">
        <h2 id="t-datos" className="text-xl font-semibold">Mis datos y mi cuenta</h2>
        <MisDatos comunicaciones={!!perfil?.acepto_comunicaciones_at} />
      </section>
    </div>
  );
}
