import type { ReactNode } from "react";

// Contenedor de gráfico con título, descripción y tabla accesible
export function TarjetaGrafico({ titulo, subtitulo, children, tabla, className = "" }: {
  titulo: string; subtitulo?: string; children: ReactNode;
  tabla?: { columnas: string[]; filas: (string | number)[][] }; className?: string;
}) {
  return (
    <section className={`tarjeta flex min-w-0 flex-col ${className}`} aria-label={titulo}>
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {subtitulo && <p className="text-sm text-tenue">{subtitulo}</p>}
      <div className="mt-3 flex-1">{children}</div>
      {tabla && (
        <details className="mt-3 text-sm print:hidden">
          <summary className="cursor-pointer text-tenue underline">Ver como tabla</summary>
          <div className="overflow-x-auto"><table className="mt-2 w-full text-left">
            <thead><tr>{tabla.columnas.map((c) => <th key={c} className="border-b border-borde py-1 pr-2 font-semibold">{c}</th>)}</tr></thead>
            <tbody>{tabla.filas.map((f, i) => <tr key={i}>{f.map((v, j) => <td key={j} className="border-b border-borde py-1 pr-2">{v}</td>)}</tr>)}</tbody>
          </table></div>
        </details>
      )}
    </section>
  );
}
