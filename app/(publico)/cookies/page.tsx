import { PaginaLegal } from "@/components/PaginaLegal";
export const metadata = { title: "Cookies" };
export default function C() {
  return (
    <PaginaLegal titulo="Aviso de cookies">
      <p>Avatar Pro usa solo cookies <strong>estrictamente necesarias</strong> para mantener tu sesión iniciada, y almacenamiento local para recordar tu tema claro u oscuro. No usamos cookies de publicidad ni de seguimiento de terceros.</p>
    </PaginaLegal>
  );
}
