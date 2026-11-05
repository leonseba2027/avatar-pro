import { NextResponse, type NextRequest } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const Cuerpo = z.object({
  tipo: z.enum(["arrepentimiento", "baja"]),
  email: z.string().trim().email().max(200),
  fecha_contratacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  detalle: z.string().trim().max(1000).optional(),
  web: z.string().max(0).optional(),
});

// Botón de arrepentimiento / baja: no requiere iniciar sesión y devuelve un código de trámite al instante
export async function POST(req: NextRequest) {
  const p = Cuerpo.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Revisá el email ingresado." }, { status: 400 });
  if (p.data.web) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida";
  const huella = createHash("sha256").update(`${ip}|${new Date().toISOString().slice(0, 10)}|tramite|${process.env.SUPABASE_SERVICE_ROLE_KEY}`).digest("hex");
  const db = adminClient();
  const { count } = await db.from("tramites_consumidor").select("*", { count: "exact", head: true }).eq("huella", huella);
  if ((count ?? 0) >= 5) return NextResponse.json({ error: "Recibimos varias solicitudes desde tu conexión hoy. Escribinos por email." }, { status: 429 });

  // Si hay sesión iniciada, se asocia al usuario (facilita procesarlo)
  let userId: string | null = null;
  try { userId = (await (await createClient()).auth.getUser()).data.user?.id ?? null; } catch {}

  const fecha = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const codigo = `${p.data.tipo === "arrepentimiento" ? "ARR" : "BAJ"}-${fecha}-${randomInt(100000, 999999)}`;
  const { error } = await db.from("tramites_consumidor").insert({
    codigo, tipo: p.data.tipo, email: p.data.email.toLowerCase(), huella, user_id: userId,
    fecha_contratacion: p.data.fecha_contratacion || null, detalle: p.data.detalle || null,
  });
  if (error) return NextResponse.json({ error: "No pudimos registrar el trámite. Escribinos por email." }, { status: 500 });
  return NextResponse.json({ ok: true, codigo, creado: new Date().toISOString() });
}
