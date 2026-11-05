"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { registrar } from "@/lib/auditoria";
import { ICONOS } from "@/lib/servicios";

const Esquema = z.object({
  nombre: z.string().trim().min(1, "Poné un nombre").max(60, "Máximo 60 caracteres"),
  descripcion: z.string().trim().max(300, "Máximo 300 caracteres").optional().transform((v) => v || null),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
  icono: z.enum(ICONOS),
});

export type Resultado = { ok: boolean; error?: string };

async function usuario() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión vencida");
  return { supabase, user };
}

export async function guardarServicio(id: string | null, datos: unknown): Promise<Resultado> {
  const p = Esquema.safeParse(datos);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const { supabase, user } = await usuario();
  if (id) {
    const { error } = await supabase.from("servicios").update(p.data).eq("id", id);
    if (error) return { ok: false, error: "No se pudo guardar." };
    await registrar(supabase, user.id, "servicio.editado", { id, nombre: p.data.nombre });
  } else {
    const { count } = await supabase.from("servicios").select("*", { count: "exact", head: true });
    const { data, error } = await supabase.from("servicios")
      .insert({ ...p.data, user_id: user.id, orden: (count ?? 0) + 1 }).select("id").single();
    if (error) return { ok: false, error: "No se pudo crear." };
    await registrar(supabase, user.id, "servicio.creado", { id: data.id, nombre: p.data.nombre });
  }
  revalidatePath("/servicios"); revalidatePath("/inicio");
  return { ok: true };
}
