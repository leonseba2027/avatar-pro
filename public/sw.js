// Service worker de Avatar Pro: instalación, página sin conexión y notificaciones push
const CACHE = "avatar-pro-v2";
const OFFLINE = "/offline.html";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, "/icons/icon-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Navegación: red primero; si no hay conexión, página offline. No se cachean datos personales.
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});

self.addEventListener("push", (e) => {
  let d = { titulo: "Avatar Pro", cuerpo: "", url: "/inicio", etiqueta: "general", tipo: "general" };
  try { d = { ...d, ...e.data.json() }; } catch {}
  e.waitUntil(self.registration.showNotification(d.titulo, {
    body: d.cuerpo, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", lang: "es-AR",
    tag: d.etiqueta, renotify: d.tipo === "aprobacion", requireInteraction: d.tipo === "aprobacion", data: { url: d.url },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/inicio", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ws) => {
    const w = ws.find((x) => x.url.startsWith(self.location.origin));
    if (w) { w.navigate(url); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
