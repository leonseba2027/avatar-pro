import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navegacion } from "@/components/app/Navegacion";
import { PieLegal } from "@/components/PieLegal";
import { Sincronizacion } from "@/components/sync/Sincronizacion";
import { VERSION_TEXTOS_LEGALES } from "@/lib/legal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: c } = await supabase.auth.getClaims();
  const sessionId = (c?.claims.session_id as string) ?? "";

  const [{ data: perfil }, { data: dispositivo }, { data: pendientes }] = await Promise.all([
    supabase.from("perfiles").select("nombre, acepto_terminos_at, acepto_transferencia_at, version_textos_legales").eq("id", user.id).single(),
    supabase.from("dispositivos").select("revocado").eq("session_id", sessionId).maybeSingle(),
    supabase.from("aprobaciones").select("id, descripcion, solicitado_session, vence_at, accion")
      .eq("estado", "pendiente").neq("solicitado_session", sessionId).gt("vence_at", new Date().toISOString()),
  ]);
  // Sin consentimiento expreso no se usa la app
  if (!perfil?.acepto_terminos_at || !perfil?.acepto_transferencia_at) redirect("/consentimiento");
  // Si cambiaron los textos legales, se vuelven a aceptar
  if (perfil.version_textos_legales !== VERSION_TEXTOS_LEGALES) redirect("/consentimiento?actualizado=1");
  // Dispositivo desconectado desde otro
  if (dispositivo?.revocado) redirect("/auth/desconectado");

  return (
    <Sincronizacion userId={user.id} sessionId={sessionId} pendientesIniciales={pendientes ?? []}>
      <div className="md:pl-64">
        <Navegacion nombre={perfil.nombre || user.email || ""} />
        <main id="contenido" className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-10 md:pt-10">{children}</main>
        <div className="pb-20 md:pb-0"><PieLegal /></div>
      </div>
    </Sincronizacion>
  );
}
