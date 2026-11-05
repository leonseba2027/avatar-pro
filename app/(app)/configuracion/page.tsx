import { createClient } from "@/lib/supabase/server";
import { TemaToggle } from "@/components/TemaToggle";

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
        <p className="text-sm text-tenue">Descargar mis datos y eliminar mi cuenta: disponibles en la Etapa 6.</p>
      </section>
    </div>
  );
}
