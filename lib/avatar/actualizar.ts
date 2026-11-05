import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { registrar } from "@/lib/auditoria";
import { generarAvatar, modeloPara } from "./claude";
import { calcularConfianza, POCOS_DATOS } from "./confianza";
import type { DatosAvatar } from "./esquema";
import { notificar } from "@/lib/push";

const MAX_TEXTO = 600_000; // caracteres enviados por análisis
export const LIMITE_DIA = Number(process.env.LIMITE_GENERACIONES_DIA || 20);

export class ErrorUsuario extends Error { constructor(m: string, public status = 400) { super(m); } }

// Genera o actualiza el avatar de un servicio. Funciona con el cliente del usuario o con el administrador
// (siempre filtrando por userId).
export async function actualizarAvatar({ db, userId, servicioId, modo, origen }: {
  db: SupabaseClient; userId: string; servicioId: string; modo: "actualizar" | "regenerar"; origen: "usuario" | "encuesta";
}) {
  const desde = new Date(Date.now() - 864e5).toISOString();
  const { count } = await db.from("registro_actividad").select("*", { count: "exact", head: true })
    .eq("user_id", userId).eq("accion", "avatar.generado").gte("creado_at", desde);
  if ((count ?? 0) >= LIMITE_DIA) throw new ErrorUsuario(`Llegaste al límite de ${LIMITE_DIA} análisis por día.`, 429);

  const { data: servicio } = await db.from("servicios").select("id, nombre, descripcion").eq("id", servicioId).eq("user_id", userId).single();
  if (!servicio) throw new ErrorUsuario("Servicio no encontrado.", 404);

  const [{ data: avatar }, { data: todas }, { data: perfil }] = await Promise.all([
    db.from("avatares").select("id, datos, version_actual").eq("servicio_id", servicioId).eq("user_id", userId).maybeSingle(),
    db.from("fuentes_datos").select("id, tipo, contenido, caracteres, creado_at, usada_en_version").eq("servicio_id", servicioId).eq("user_id", userId).order("creado_at", { ascending: false }),
    db.from("perfiles").select("modelo_ia").eq("id", userId).single(),
  ]);
  const fuentes = todas ?? [];
  const desdeCero = !avatar || modo === "regenerar";
  const pendientes = fuentes.filter((f) => f.usada_en_version === null);
  let aEnviar = desdeCero ? fuentes : pendientes;
  if (!desdeCero && aEnviar.length === 0) throw new ErrorUsuario("No hay datos nuevos para analizar. Cargá información primero.");
  let total = 0;
  aEnviar = aEnviar.filter((f) => (total += f.caracteres) <= MAX_TEXTO);

  const { avatar: nuevo, modelo } = await generarAvatar({
    modelo: modeloPara(perfil?.modelo_ia), servicio,
    actual: desdeCero ? null : (avatar!.datos as DatosAvatar),
    fuentes: aEnviar.map((f) => ({ tipo: f.tipo, contenido: f.contenido })),
  });
  const { cambios, ...datos } = nuevo;
  const confianza = calcularConfianza(fuentes);
  const version = (avatar?.version_actual ?? 0) + 1;

  let avatarId = avatar?.id;
  if (avatar) {
    const { error } = await db.from("avatares").update({ datos, nombre_ficticio: datos.nombre_ficticio, version_actual: version, confianza, es_hipotesis: fuentes.length === 0 }).eq("id", avatar.id).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { data: creado, error } = await db.from("avatares").insert({
      user_id: userId, servicio_id: servicioId, nombre_ficticio: datos.nombre_ficticio, datos, confianza, es_hipotesis: fuentes.length === 0,
    }).select("id").single();
    if (error || !creado) throw error;
    avatarId = creado.id;
  }
  await db.from("avatar_versiones").insert({
    avatar_id: avatarId, user_id: userId, version, datos, confianza, modelo,
    cambios: version === 1 ? ["Primera versión del avatar."] : cambios,
    fuentes_analizadas: aEnviar.length,
    motivo: !avatar ? "creacion" : modo === "regenerar" ? "regeneracion" : "actualizacion",
  });
  if (aEnviar.length) await db.from("fuentes_datos").update({ usada_en_version: version }).in("id", aEnviar.map((f) => f.id)).eq("user_id", userId);
  await registrar(db, userId, "avatar.generado", { servicioId, version, modo, origen, fuentes: aEnviar.length, modelo });

  // Avisos
  const url = `/avatar/${servicioId}`;
  await notificar(userId, "avatar", {
    titulo: `Avatar de ${servicio.nombre} actualizado`,
    cuerpo: origen === "encuesta" ? `Nuevas respuestas de la encuesta generaron la versión ${version}.` : `Versión ${version} lista.${cambios[0] ? " " + cambios[0] : ""}`,
    url: `${url}?tab=historial`,
  });
  if (confianza < POCOS_DATOS)
    await notificar(userId, "pocos_datos", { titulo: `${servicio.nombre}: pocos datos`, cuerpo: `La confianza es ${confianza}/100. Cargá más información o compartí la encuesta.`, url: `${url}?tab=alimentar` });

  return { version, cambios, confianza, recortado: aEnviar.length < (desdeCero ? fuentes : pendientes).length };
}
