import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registrar } from "@/lib/auditoria";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: c } = await supabase.auth.getClaims();
    if (c?.claims.session_id) await supabase.from("dispositivos").update({ revocado: true }).eq("session_id", c.claims.session_id);
    await registrar(supabase, user.id, "sesion.cierre");
  }
  await supabase.auth.signOut();
  return NextResponse.redirect(`${request.nextUrl.origin}/login`, { status: 303 });
}
