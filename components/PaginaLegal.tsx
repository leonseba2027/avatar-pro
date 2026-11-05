import Link from "next/link";
import { PieLegal } from "./PieLegal";
import { textoLegal } from "@/lib/legal-md";

export function PaginaLegal({ archivo, children }: { archivo: string; children?: React.ReactNode }) {
  return (
    <>
      <main id="contenido" className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-6 print:hidden"><Link href="/" className="underline">← Volver a Avatar Pro</Link></p>
        <article className="texto-legal" dangerouslySetInnerHTML={{ __html: textoLegal(archivo) }} />
        {children}
      </main>
      <PieLegal />
    </>
  );
}
