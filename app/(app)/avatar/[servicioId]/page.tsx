import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Icono } from "@/components/Icono";
import { Ilustracion } from "@/components/avatar/Ilustracion";
import { etiquetaConfianza, POCOS_DATOS } from "@/lib/avatar/confianza";
import type { DatosAvatar } from "@/lib/avatar/esquema";
import { BotonGenerar } from "./BotonGenerar";
import { Alimentar } from "./Alimentar";
import { Historial } from "./Historial";
import { Demograficos } from "@/components/avatar/Demograficos";
import { MundoInterno } from "@/components/avatar/MundoInterno";

const TABS = [{ id: "demograficos", nombre: "Datos demográficos" }, { id: "mundo", nombre: "Mundo interno" }, { id: "alimentar", nombre: "Alimentar" }, { id: "historial", nombre: "Historial" }] as const;

export default async function PaginaAvatar({ params, searchParams }: { params: Promise<{ servicioId: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { servicioId } = await params;
  const tab = (await searchParams).tab ?? "demograficos";
  const supabase = await createClient();

  const { data: servicio } = await supabase.from("servicios").select("id, nombre, color, icono").eq("id", servicioId).maybeSingle();
  if (!servicio) notFound();
  const [{ data: avatar }, { data: fuentes }] = await Promise.all([
    supabase.from("avatares").select("id, nombre_ficticio, semilla_ilustracion, version_actual, datos, confianza, es_hipotesis, actualizado_at").eq("servicio_id", servicioId).maybeSingle(),
    supabase.from("fuentes_datos").select("id, tipo, origen, nombre_archivo, caracteres, creado_at, usada_en_version, contenido").eq("servicio_id", servicioId).order("creado_at", { ascending: false }),
  ]);
  const { data: versiones } = avatar
    ? await supabase.from("avatar_versiones").select("version, cambios, confianza, fuentes_analizadas, motivo, creado_at").eq("avatar_id", avatar.id).order("version", { ascending: false })
    : { data: [] };
  const nuevos = (fuentes ?? []).filter((f) => f.usada_en_version === null).length;
  const conf = avatar ? etiquetaConfianza(avatar.confianza) : null;

  return (
    <div>
      <p className="mb-4"><Link href="/inicio" className="underline">← Inicio</Link></p>
      <header className="tarjeta mb-6 flex flex-wrap items-center gap-5" style={{ borderTop: `6px solid ${servicio.color}` }}>
        {avatar ? <Ilustracion semilla={avatar.semilla_ilustracion} titulo={avatar.nombre_ficticio} /> :
          <span className="grid h-24 w-24 place-items-center rounded-full text-white" style={{ background: servicio.color }}><Icono nombre={servicio.icono} size={40} /></span>}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-semibold" style={{ color: servicio.color }}><Icono nombre={servicio.icono} size={18} /> {servicio.nombre}</p>
          <h1 className="text-3xl font-bold">{avatar?.nombre_ficticio ?? "Sin avatar todavía"}</h1>
          {avatar && <p className="text-tenue">{(avatar.datos as DatosAvatar).resumen}</p>}
        </div>
        {avatar && conf && (
          <div className="text-center" aria-label={`Nivel de confianza ${avatar.confianza} de 100, ${conf.texto}`}>
            <p className="text-4xl font-bold">{avatar.confianza}<span className="text-lg text-tenue">/100</span></p>
            <p className="font-semibold">Confianza {conf.texto}</p>
            <p className="text-xs text-tenue">v{avatar.version_actual}</p>
          </div>
        )}
      </header>

      {avatar && avatar.confianza < POCOS_DATOS && (
        <p className="mb-6 flex items-start gap-2 rounded-xl bg-amber-100 p-3 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          <AlertTriangle size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          {avatar.es_hipotesis ? "Este avatar es una hipótesis: todavía no tiene datos reales." : conf?.detalle}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <BotonGenerar servicioId={servicioId} existe={!!avatar} nuevos={nuevos} />
        {avatar && <Link href={`/avatar/${servicioId}/infografia`} className="boton-secundario"><Download size={20} aria-hidden="true" /> Exportar ficha</Link>}
      </div>

      <nav aria-label="Secciones del avatar" className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-suave p-1">
        {TABS.map((t) => (
          <Link key={t.id} href={`?tab=${t.id}`} aria-current={tab === t.id ? "page" : undefined} scroll={false}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-center font-semibold ${tab === t.id ? "bg-tarjeta shadow" : "text-tenue"}`}>
            {t.nombre}{t.id === "alimentar" && nuevos > 0 ? ` (${nuevos})` : ""}
          </Link>
        ))}
      </nav>

      {tab === "alimentar" ? <Alimentar servicioId={servicioId} fuentes={fuentes ?? []} />
        : tab === "historial" ? <Historial servicioId={servicioId} versiones={(versiones ?? []) as never} actual={avatar?.version_actual ?? 0} />
        : avatar && tab === "mundo" ? <MundoInterno d={avatar.datos as DatosAvatar} color={servicio.color} />
        : avatar ? <Demograficos d={avatar.datos as DatosAvatar} color={servicio.color} confianza={avatar.confianza} />
        : <p className="tarjeta text-tenue">Tocá “Generar avatar” para crear una primera hipótesis, o andá a “Alimentar” para cargar datos reales primero (recomendado).</p>}
    </div>
  );
}
