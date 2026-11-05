"use client";
import { guardarSuscripcion, quitarSuscripcion } from "@/app/(app)/configuracion/avisos-actions";

export const soportado = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
export const esIOSsinInstalar = () => typeof window !== "undefined" && /iPhone|iPad/.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches;

function claveAplicacion(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function activarAvisos(): Promise<"ok" | "denegado" | "no-soportado" | "error"> {
  if (!soportado()) return "no-soportado";
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return "denegado";
  try {
    const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
    await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({
      userVisibleOnly: true, applicationServerKey: claveAplicacion(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    }));
    return (await guardarSuscripcion(sub.toJSON())) ? "ok" : "error";
  } catch { return "error"; }
}

export async function desactivarAvisos() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) { await quitarSuscripcion(sub.endpoint); await sub.unsubscribe(); }
}

export async function suscripto() {
  if (!soportado() || Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration();
  return !!(await reg?.pushManager.getSubscription());
}
