"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VERSION_TEXTOS_LEGALES } from "@/lib/legal";
import { registrar } from "@/lib/auditoria";

export async function aceptarConsentimiento(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (fd.get("terminos") !== "on" || fd.get("transferencia") !== "on") redirect("/consentimiento?error=1");
  const ahora = new Date().toISOString();
  const comunicaciones = fd.get("comunicaciones") === "on";
  await supabase.from("perfiles").update({
    acepto_terminos_at: ahora, acepto_transferencia_at: ahora,
    acepto_comunicaciones_at: comunicaciones ? ahora : null,
    version_textos_legales: VERSION_TEXTOS_LEGALES,
  }).eq("id", user.id);
  await registrar(supabase, user.id, "consentimiento.aceptado", { version: VERSION_TEXTOS_LEGALES, comunicaciones });
  redirect("/inicio");
}
