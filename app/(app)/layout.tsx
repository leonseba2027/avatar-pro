import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navegacion } from "@/components/app/Navegacion";
import { PieLegal } from "@/components/PieLegal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase.from("perfiles")
    .select("nombre, acepto_terminos_at, acepto_transferencia_at").eq("id", user.id).single();
  // Sin consentimiento expreso no se usa la app
  if (!perfil?.acepto_terminos_at || !perfil?.acepto_transferencia_at) redirect("/consentimiento");

  return (
    <div className="md:pl-64">
      <Navegacion nombre={perfil.nombre || user.email || ""} />
      <main id="contenido" className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-10 md:pt-10">{children}</main>
      <div className="pb-20 md:pb-0"><PieLegal /></div>
    </div>
  );
}
