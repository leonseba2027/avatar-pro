"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Settings, LogOut } from "lucide-react";

const ITEMS = [
  { href: "/inicio", label: "Inicio", I: Home },
  { href: "/servicios", label: "Servicios", I: Layers },
  { href: "/configuracion", label: "Configuración", I: Settings },
];

export function Navegacion({ nombre }: { nombre: string }) {
  const path = usePathname();
  const activo = (h: string) => path === h || path.startsWith(h + "/");
  return (
    <>
      {/* Lateral en computadora */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-borde bg-tarjeta p-4 md:flex">
        <Link href="/inicio" className="mb-8 flex items-center gap-2 text-xl font-bold">
          <img src="/icons/icon.svg" alt="" width={36} height={36} /> Avatar Pro
        </Link>
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {ITEMS.map(({ href, label, I }) => (
            <Link key={href} href={href} aria-current={activo(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 font-medium ${activo(href) ? "bg-primario text-white dark:text-gray-900" : "hover:bg-suave"}`}>
              <I size={20} aria-hidden="true" /> {label}
            </Link>
          ))}
        </nav>
        <p className="truncate px-3 text-sm text-tenue">{nombre}</p>
        <form action="/auth/salir" method="post">
          <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-suave"><LogOut size={20} aria-hidden="true" /> Cerrar sesión</button>
        </form>
      </aside>
      {/* Barra inferior en celular */}
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-borde bg-tarjeta pb-[env(safe-area-inset-bottom)] md:hidden">
        {ITEMS.map(({ href, label, I }) => (
          <Link key={href} href={href} aria-current={activo(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${activo(href) ? "text-primario" : "text-tenue"}`}>
            <I size={24} aria-hidden="true" /> {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
