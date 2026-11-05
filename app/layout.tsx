import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegistrarSW } from "@/components/RegistrarSW";
import { AvisoCookies } from "@/components/AvisoCookies";

export const metadata: Metadata = {
  title: { default: "Avatar Pro", template: "%s · Avatar Pro" },
  description: "Construí el avatar de cliente ideal de cada servicio que ofrecés.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Avatar Pro", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4338ca" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

// Aplica el tema antes de pintar para evitar parpadeo
const scriptTema = `(function(){try{var t=localStorage.getItem('tema')||'sistema';var d=t==='oscuro'||(t==='sistema'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primario focus:px-4 focus:py-2 focus:text-white">
          Saltar al contenido
        </a>
        {children}
        <RegistrarSW />
        <AvisoCookies />
      </body>
    </html>
  );
}
