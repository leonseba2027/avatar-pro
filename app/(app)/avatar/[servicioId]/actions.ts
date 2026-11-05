"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { registrar } from "@/lib/auditoria";
import { anonimizar } from "@/lib/avatar/anonimizar";
import { extraerTexto, MAX_CARACTERES } from "@/lib/avatar/extraer";
import { TIPOS_FUENTE } from "@/lib/avatar/tipos";

export type ResultadoCarga = { ok: boolean; mensaje: string };

const Tipo = z.enum(TIPOS_FUENTE.map((t) => t.valor) as [string, ...string[]]);

async function sesion() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión vencida");
  return { supabase, user };
}

export async function cargarFuente(servicioId: string, _prev: ResultadoCarga | null, fd: FormData): Promise<ResultadoCarga> {
  const { supabase, user } = await sesion();
  const tipo = Tipo.safeParse(fd.get("tipo"));
  if (!tipo.success) return { ok: false, mensaje: "Elegí el tipo de dato." };

  const archivo = fd.get("archivo");
  let texto = String(fd.get("texto") ?? "");
  let nombreArchivo: string | null = null;
  try {
    if (archivo instanceof File && archivo.size > 0) {
      texto = await extraerTexto(archivo);
      nombreArchivo = archivo.name.slice(0, 120);
    }
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo leer el archivo." };
  }
  if (texto.trim().length < 20) return { ok: false, mensaje: "Pegá un texto o subí un archivo (mínimo 20 caracteres)." };

  const { texto: limpio, reemplazos, oracionesSensibles } = anonimizar(texto.slice(0, MAX_CARACTERES));
  if (limpio.length < 20) return { ok: false, mensaje: "Después de quitar datos personales y sensibles no quedó texto útil." };

  const { error } = await supabase.from("fuentes_datos").insert({
    user_id: user.id, servicio_id: servicioId, tipo: tipo.data,
    origen: nombreArchivo ? "archivo" : "pegado", nombre_archivo: nombreArchivo,
    contenido: limpio, caracteres: limpio.length,
  });
  if (error) return { ok: false, mensaje: "No se pudo guardar el dato." };
  await registrar(supabase, user.id, "fuente.cargada", { servicioId, tipo: tipo.data, caracteres: limpio.length, reemplazos, oracionesSensibles });
  revalidatePath(`/avatar/${servicioId}`);

  const avisos = [
    reemplazos > 0 && `quitamos ${reemplazos} dato(s) de contacto o identificación`,
    oracionesSensibles > 0 && `descartamos ${oracionesSensibles} frase(s) con datos sensibles`,
    texto.length > MAX_CARACTERES && "el texto se recortó a 200.000 caracteres",
  ].filter(Boolean);
  return { ok: true, mensaje: `Dato guardado${avisos.length ? ` (${avisos.join("; ")})` : ""}. Tocá "Actualizar avatar" para analizarlo.` };
}

export async function eliminarFuente(servicioId: string, id: string) {
  const { supabase, user } = await sesion();
  await supabase.from("fuentes_datos").delete().eq("id", id);
  await registrar(supabase, user.id, "fuente.eliminada", { servicioId, id });
  revalidatePath(`/avatar/${servicioId}`);
}

export async function restaurarVersion(servicioId: string, version: number): Promise<ResultadoCarga> {
  const { supabase, user } = await sesion();
  const { data: avatar } = await supabase.from("avatares").select("id, version_actual, confianza").eq("servicio_id", servicioId).single();
  if (!avatar) return { ok: false, mensaje: "No existe el avatar." };
  const { data: v } = await supabase.from("avatar_versiones").select("datos").eq("avatar_id", avatar.id).eq("version", version).single();
  if (!v) return { ok: false, mensaje: "No existe esa versión." };
  const nueva = avatar.version_actual + 1;
  await supabase.from("avatar_versiones").insert({
    avatar_id: avatar.id, user_id: user.id, version: nueva, datos: v.datos,
    cambios: [`Se restauró la versión ${version}.`], confianza: avatar.confianza, motivo: "restauracion",
  });
  await supabase.from("avatares").update({ datos: v.datos, version_actual: nueva, nombre_ficticio: (v.datos as { nombre_ficticio: string }).nombre_ficticio }).eq("id", avatar.id);
  await registrar(supabase, user.id, "avatar.restaurado", { servicioId, desde: version, nueva });
  revalidatePath(`/avatar/${servicioId}`); revalidatePath("/inicio");
  return { ok: true, mensaje: `Versión ${version} restaurada como versión ${nueva}.` };
}
