import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VERSION_TEXTOS_LEGALES } from "@/lib/legal";
import { registrar } from "@/lib/auditoria";

// Destino de: login con Google, confirmación de email y recuperación de contraseña
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/inicio";

  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login`);

  // Consentimiento dado en la pantalla de registro antes de ir a Google
  const c = searchParams.get("c") ?? "";
  if (c.includes("t") && c.includes("x")) {
    const { data: perfil } = await supabase.from("perfiles").select("acepto_terminos_at").eq("id", data.user.id).single();
    if (perfil && !perfil.acepto_terminos_at) {
      const ahora = new Date().toISOString();
      await supabase.from("perfiles").update({
        acepto_terminos_at: ahora, acepto_transferencia_at: ahora,
        acepto_comunicaciones_at: c.includes("m") ? ahora : null,
        version_textos_legales: VERSION_TEXTOS_LEGALES,
      }).eq("id", data.user.id);
      await registrar(supabase, data.user.id, "consentimiento.aceptado", { via: "google", comunicaciones: c.includes("m") });
    }
  }
  await registrar(supabase, data.user.id, "sesion.inicio");
  return NextResponse.redirect(`${origin}${destino}`);
}
