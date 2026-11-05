import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mensajeError } from "@/lib/avatar/claude";
import { actualizarAvatar, ErrorUsuario } from "@/lib/avatar/actualizar";

export const maxDuration = 300; // la IA puede tardar 1–3 minutos

const Cuerpo = z.object({ servicioId: z.string().uuid(), modo: z.enum(["actualizar", "regenerar"]), aprobacionId: z.string().uuid().optional() });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });

  const p = Cuerpo.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const { servicioId, modo, aprobacionId } = p.data;

  // Regenerar un avatar existente requiere una aprobación vigente (Etapa 4)
  const { data: existe } = await supabase.from("avatares").select("id").eq("servicio_id", servicioId).maybeSingle();
  const conAprobacion = !!existe && modo === "regenerar";
  if (conAprobacion) {
    if (!aprobacionId) return NextResponse.json({ error: "Regenerar requiere aprobación." }, { status: 403 });
    const { data: reclamo } = await supabase.from("aprobaciones").update({ estado: "ejecutada" })
      .eq("id", aprobacionId).eq("estado", "aprobada").eq("accion", "regenerar_avatar").eq("detalle->>servicioId", servicioId)
      .select("id").maybeSingle();
    if (!reclamo) return NextResponse.json({ error: "La aprobación no es válida o ya se usó." }, { status: 403 });
  }
  const marcar = async (resultado: string, fallo = false) => {
    if (conAprobacion) await supabase.from("aprobaciones").update({ resultado, ...(fallo ? { estado: "fallida" } : {}) }).eq("id", aprobacionId!);
  };

  try {
    const r = await actualizarAvatar({ db: supabase, userId: user.id, servicioId, modo, origen: "usuario" });
    await marcar(`Avatar regenerado (versión ${r.version}).`);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    console.error("generar avatar", e);
    const msg = e instanceof ErrorUsuario ? e.message : mensajeError(e);
    await marcar(msg, true);
    return NextResponse.json({ error: msg }, { status: e instanceof ErrorUsuario ? e.status : 502 });
  }
}
