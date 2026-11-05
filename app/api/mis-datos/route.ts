import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registrar } from "@/lib/auditoria";

// Derecho de acceso (art. 14, Ley 25.326): copia completa de los datos del usuario
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });

  const tablas = ["perfiles", "servicios", "avatares", "avatar_versiones", "fuentes_datos", "encuestas", "respuestas_encuesta", "dispositivos", "aprobaciones", "registro_actividad"] as const;
  const resultados = await Promise.all(tablas.map((t) => supabase.from(t).select("*")));
  const { data: subs } = await supabase.from("push_suscripciones").select("id, session_id, creado_at"); // sin claves técnicas

  const exportacion = {
    generado: new Date().toISOString(),
    aviso: "Copia de tus datos personales en Avatar Pro (art. 14, Ley 25.326). Formato JSON legible por máquinas.",
    cuenta: { id: user.id, email: user.email, creado: user.created_at, ultimo_ingreso: user.last_sign_in_at, proveedores: user.app_metadata?.providers ?? [] },
    ...Object.fromEntries(tablas.map((t, i) => [t, resultados[i].data ?? []])),
    suscripciones_avisos: subs ?? [],
  };
  await registrar(supabase, user.id, "datos.descargados");
  return new NextResponse(JSON.stringify(exportacion, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mis-datos-avatar-pro-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
