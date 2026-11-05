import Link from "next/link";
export const metadata = { title: "Cuenta eliminada" };
export default async function CuentaEliminada({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  return (
    <main id="contenido" className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="mb-3 text-3xl font-bold">Tu cuenta fue eliminada</h1>
      <p className="mb-4 text-tenue">Borramos tu cuenta y todos sus datos. Las copias de seguridad se renuevan en un plazo máximo de 30 días.</p>
      {codigo && /^BAJ-\d{8}-\d{6}$/.test(codigo) && <p className="tarjeta mb-6">Código de baja: <strong className="select-all text-xl">{codigo}</strong></p>}
      <Link href="/login" className="underline">Volver al inicio</Link>
    </main>
  );
}
