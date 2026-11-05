import "server-only";
import { createClient } from "@/lib/supabase/server";

// Sesión actual verificada (el session_id identifica al dispositivo)
export async function sesionActual() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub || !claims.session_id) throw new Error("Sesión vencida");
  return { supabase, userId: claims.sub as string, sessionId: claims.session_id as string, email: (claims.email as string | undefined) ?? null };
}

export function describirDispositivo(ua: string) {
  const tipo: "movil" | "tablet" | "escritorio" = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "movil" : "escritorio";
  const so = /Windows/i.test(ua) ? "Windows" : /iPhone|iPad|iOS/i.test(ua) ? "iOS" : /Android/i.test(ua) ? "Android" : /Mac OS/i.test(ua) ? "Mac" : /Linux/i.test(ua) ? "Linux" : "Otro";
  const nav = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const tipoTxt = { movil: "Celular", tablet: "Tablet", escritorio: "Computadora" }[tipo];
  return { tipo, nombre: `${tipoTxt} · ${nav} en ${so}` };
}
