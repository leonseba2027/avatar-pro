import { after, NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { adminClient } from "@/lib/supabase/admin";
import { anonimizar } from "@/lib/avatar/anonimizar";
import { actualizarAvatar } from "@/lib/avatar/actualizar";
import { RespuestaSchema } from "@/lib/encuesta/plantilla";
import { notificar } from "@/lib/push";

export const maxDuration = 300; // el reanálisis automático corre después de responder

const MAX_POR_DIA = 3; // respuestas por persona (huella) y encuesta

async function verificarTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // CAPTCHA opcional: si no está configurado, se usan los otros frenos
  if (!token) return false;
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  }).then((x) => x.json()).catch(() => ({ success: false }));
  return !!r.success;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = RespuestaSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Revisá tus respuestas y aceptá el consentimiento." }, { status: 400 });
  const r = p.data;
  if (r.web) return NextResponse.json({ ok: true }); // robot: se descarta en silencio

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida";
  if (!(await verificarTurnstile(r.turnstile, ip))) return NextResponse.json({ error: "No pudimos verificar que no seas un robot." }, { status: 400 });

  const db = adminClient();
  const { data: enc } = await db.from("encuestas").select("id, user_id, servicio_id, preguntas, incluir_demografia, servicios(nombre)")
    .eq("slug", slug).eq("publicada", true).maybeSingle();
  if (!enc) return NextResponse.json({ error: "Esta encuesta no está disponible." }, { status: 404 });

  // Huella diaria con sal: frena spam sin guardar la IP
  const dia = new Date().toISOString().slice(0, 10);
  const huella = createHash("sha256").update(`${ip}|${dia}|${enc.id}|${process.env.SUPABASE_SERVICE_ROLE_KEY}`).digest("hex");
  const { count } = await db.from("respuestas_encuesta").select("*", { count: "exact", head: true }).eq("huella", huella);
  if ((count ?? 0) >= MAX_POR_DIA) return NextResponse.json({ error: "Ya recibimos tus respuestas. ¡Gracias!" }, { status: 429 });

  // Armar texto y anonimizar (quita contactos e identificadores y descarta datos sensibles)
  const preguntas = enc.preguntas as { id: string; texto: string }[];
  const abiertas = preguntas
    .map((q) => ({ id: q.id, q: q.texto, a: anonimizar((r.abiertas[q.id] ?? "").trim()).texto }))
    .filter((x) => x.a.length > 0);
  const demo = enc.incluir_demografia && r.demografia ? Object.entries(r.demografia)
    .filter(([, v]) => v && v !== "Prefiero no decir" && (!Array.isArray(v) || v.length))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`) : [];
  if (abiertas.length === 0 && demo.length === 0) return NextResponse.json({ error: "Respondé al menos una pregunta." }, { status: 400 });

  const contenido = [demo.length ? `Datos generales — ${demo.join(" | ")}` : "", ...abiertas.map((x) => `P: ${x.q}\nR: ${x.a}`)].filter(Boolean).join("\n");
  const { data: fuente, error } = await db.from("fuentes_datos").insert({
    user_id: enc.user_id, servicio_id: enc.servicio_id, tipo: "encuesta", origen: "encuesta_publica",
    contenido, caracteres: contenido.length,
  }).select("id").single();
  if (error || !fuente) return NextResponse.json({ error: "No pudimos guardar tu respuesta. Probá de nuevo." }, { status: 500 });
  await db.from("respuestas_encuesta").insert({
    encuesta_id: enc.id, user_id: enc.user_id, fuente_id: fuente.id, huella,
    respuestas: { demografia: enc.incluir_demografia ? r.demografia ?? {} : {}, abiertas: Object.fromEntries(abiertas.map((x) => [x.id, x.a])) },
  });

  const servicio = (enc.servicios as unknown as { nombre: string } | null)?.nombre ?? "tu servicio";
  const { data: pendientes } = await db.rpc("sumar_respuesta", { p_encuesta: enc.id });
  const { data: perfil } = await db.from("perfiles").select("reanalisis_cada").eq("id", enc.user_id).single();
  const umbral = perfil?.reanalisis_cada ?? 5;

  after(async () => {
    await notificar(enc.user_id, "encuesta", {
      titulo: `Nueva respuesta: ${servicio}`,
      cuerpo: (pendientes as number) >= umbral ? "Se alcanzó el número de respuestas: reanalizando el avatar…" : `Llevás ${pendientes} de ${umbral} respuestas para el próximo reanálisis.`,
      url: `/avatar/${enc.servicio_id}?tab=encuesta`,
    });
    if ((pendientes as number) >= umbral) {
      await db.from("encuestas").update({ respuestas_sin_analizar: 0 }).eq("id", enc.id);
      try {
        await actualizarAvatar({ db, userId: enc.user_id, servicioId: enc.servicio_id, modo: "actualizar", origen: "encuesta" });
      } catch (e) {
        console.error("reanálisis automático", e);
      }
    }
  });

  return NextResponse.json({ ok: true });
}
