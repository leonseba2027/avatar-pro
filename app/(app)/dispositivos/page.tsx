import { createClient } from "@/lib/supabase/server";
import { ListaDispositivos } from "./ListaDispositivos";

export const metadata = { title: "Dispositivos" };

export default async function Dispositivos() {
  const supabase = await createClient();
  const { data: c } = await supabase.auth.getClaims();
  const { data } = await supabase.rpc("mis_dispositivos_activos");
  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Dispositivos conectados</h1>
      <p className="mb-6 text-tenue">Cada vez que iniciás sesión en un celular o computadora aparece acá. Si no reconocés alguno, desconectalo y cambiá tu contraseña.</p>
      <ListaDispositivos dispositivos={data ?? []} actual={(c?.claims.session_id as string) ?? ""} />
    </div>
  );
}
