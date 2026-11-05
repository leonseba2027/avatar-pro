"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { registrar } from "@/lib/auditoria";
import { EncuestaEdicionSchema, preguntasIniciales } from "@/lib/encuesta/plantilla";

async function sesion() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión vencida");
  return { supabase, user };
}

export async function crearEncuesta(servicioId: string) {
  const { supabase, user } = await sesion();
  const { data: s } = await supabase.from("servicios").select("nombre").eq("id", servicioId).single();
  if (!s) return;
  await supabase.from("encuestas").insert({
    user_id: user.id, servicio_id: servicioId, titulo: `Encuesta sobre ${s.nombre}`,
    introduccion: "¡Gracias por tomarte 3 minutos! Tus respuestas son anónimas y nos ayudan a entender mejor lo que necesitás.",
    preguntas: preguntasIniciales(s.nombre),
  });
  await registrar(supabase, user.id, "encuesta.creada", { servicioId });
  revalidatePath(`/avatar/${servicioId}`);
}

export async function guardarEncuesta(servicioId: string, id: string, datos: unknown): Promise<{ ok: boolean; mensaje: string }> {
  const p = EncuestaEdicionSchema.safeParse(datos);
  if (!p.success) return { ok: false, mensaje: "Revisá los campos: cada pregunta debe tener entre 5 y 200 caracteres (máximo 8 preguntas)." };
  const { supabase, user } = await sesion();
  const { error } = await supabase.from("encuestas").update(p.data).eq("id", id);
  if (error) return { ok: false, mensaje: "No se pudo guardar." };
  await registrar(supabase, user.id, "encuesta.editada", { id });
  revalidatePath(`/avatar/${servicioId}`);
  return { ok: true, mensaje: "Encuesta guardada." };
}

// Despublicar no requiere aprobación (reduce exposición)
export async function despublicarEncuesta(servicioId: string, id: string) {
  const { supabase, user } = await sesion();
  await supabase.from("encuestas").update({ publicada: false }).eq("id", id);
  await registrar(supabase, user.id, "encuesta.despublicada", { id });
  revalidatePath(`/avatar/${servicioId}`);
}

export async function eliminarRespuesta(servicioId: string, respuestaId: string, fuenteId: string | null) {
  const { supabase, user } = await sesion();
  await supabase.from("respuestas_encuesta").delete().eq("id", respuestaId);
  if (fuenteId) await supabase.from("fuentes_datos").delete().eq("id", fuenteId);
  await registrar(supabase, user.id, "encuesta.respuesta_eliminada", { respuestaId });
  revalidatePath(`/avatar/${servicioId}`);
}
