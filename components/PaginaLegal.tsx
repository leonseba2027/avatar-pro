import Link from "next/link";
import { PieLegal } from "./PieLegal";

export function PaginaLegal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <main id="contenido" className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-6"><Link href="/" className="underline">← Volver a Avatar Pro</Link></p>
        <h1 className="mb-2 text-3xl font-bold">{titulo}</h1>
        <p className="mb-8 rounded-xl bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          Borrador preliminar. La versión completa se incorpora en la Etapa 6 y debe ser revisada por un abogado antes de publicarse.
        </p>
        <div className="space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold">{children}</div>
      </main>
      <PieLegal />
    </>
  );
}
