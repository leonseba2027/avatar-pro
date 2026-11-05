import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

// Acciones importantes que requieren aprobación desde otro dispositivo
export const ACCIONES = {
  eliminar_servicio: z.object({ servicioId: z.string().uuid() }),
  eliminar_avatar: z.object({ servicioId: z.string().uuid() }),
  regenerar_avatar: z.object({ servicioId: z.string().uuid() }),
  publicar_encuesta: z.object({ encuestaId: z.string().uuid() }),
  cambiar_configuracion: z.object({ modelo_ia: z.enum(["opus", "sonnet"]), reanalisis_cada: z.number().int().min(1).max(50) }),
} as const;
export type Accion = keyof typeof ACCIONES;
export const esAccion = (a: string): a is Accion => a in ACCIONES;

export async function describir(supabase: SupabaseClient, accion: Accion, d: Record<string, unknown>): Promise<string> {
  const servicio = async () => (await supabase.from("servicios").select("nombre").eq("id", d.servicioId as string).single()).data?.nombre ?? "servicio";
  switch (accion) {
    case "eliminar_servicio": return `Eliminar el servicio "${await servicio()}" y todos sus datos`;
    case "eliminar_avatar": return `Eliminar el avatar de "${await servicio()}" y su historial`;
    case "regenerar_avatar": return `Regenerar desde cero el avatar de "${await servicio()}"`;
    case "publicar_encuesta": return "Publicar la encuesta pública";
    case "cambiar_configuracion": return `Cambiar configuración: modelo ${d.modelo_ia === "opus" ? "Opus (máxima calidad)" : "Sonnet (más económico)"}, reanálisis cada ${d.reanalisis_cada} respuestas`;
  }
}

// Ejecuta una acción ya aprobada. regenerar_avatar se ejecuta aparte (tarda minutos).
export async function ejecutar(supabase: SupabaseClient, userId: string, accion: Accion, d: Record<string, unknown>): Promise<string> {
  switch (accion) {
    case "eliminar_servicio": {
      const { error } = await supabase.from("servicios").delete().eq("id", d.servicioId as string);
      if (error) throw error;
      return "Servicio eliminado.";
    }
    case "eliminar_avatar": {
      const { error } = await supabase.from("avatares").delete().eq("servicio_id", d.servicioId as string);
      if (error) throw error;
      await supabase.from("fuentes_datos").update({ usada_en_version: null }).eq("servicio_id", d.servicioId as string);
      return "Avatar eliminado. Los datos cargados se conservan.";
    }
    case "cambiar_configuracion": {
      const { error } = await supabase.from("perfiles").update({ modelo_ia: d.modelo_ia, reanalisis_cada: d.reanalisis_cada }).eq("id", userId);
      if (error) throw error;
      return "Configuración actualizada.";
    }
    case "publicar_encuesta": {
      const { error } = await supabase.from("encuestas").update({ publicada: true, publicada_at: new Date().toISOString() }).eq("id", d.encuestaId as string);
      if (error) throw error;
      return "Encuesta publicada.";
    }
    case "regenerar_avatar":
      throw new Error("Se ejecuta desde /api/avatar/generar");
  }
}
