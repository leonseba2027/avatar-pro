import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { TITULAR } from "@/lib/legal";
import { FormularioEncuesta } from "./FormularioEncuesta";

export const dynamic = "force-dynamic";
export const metadata = { title: "Encuesta", robots: { index: false } };

export default async function EncuestaPublica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-f0-9]{10,40}$/.test(slug)) notFound();
  // Solo se leen campos públicos de encuestas publicadas
  const { data: enc } = await adminClient().from("encuestas")
    .select("titulo, introduccion, preguntas, incluir_demografia, servicios(color)").eq("slug", slug).eq("publicada", true).maybeSingle();
  if (!enc) notFound();
  const color = (enc.servicios as unknown as { color: string } | null)?.color ?? "#4338ca";
  return (
    <main id="contenido" className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 h-2 rounded-full" style={{ background: color }} />
      <h1 className="mb-2 text-3xl font-bold">{enc.titulo}</h1>
      {enc.introduccion && <p className="mb-6 whitespace-pre-line text-tenue">{enc.introduccion}</p>}
      <FormularioEncuesta slug={slug} preguntas={enc.preguntas as { id: string; texto: string }[]} demografia={enc.incluir_demografia}
        turnstileKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null} titular={TITULAR.nombre} />
    </main>
  );
}
