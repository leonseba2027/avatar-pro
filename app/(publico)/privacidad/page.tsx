import { PaginaLegal } from "@/components/PaginaLegal";
import { LEYENDA_AAIP, TITULAR } from "@/lib/legal";
export const metadata = { title: "Política de privacidad" };
export default function P() {
  return (
    <PaginaLegal titulo="Política de privacidad">
      <h2>Responsable</h2>
      <p>{TITULAR.nombre}, CUIT {TITULAR.cuit}, {TITULAR.domicilio}. Contacto: {TITULAR.email}.</p>
      <h2>Qué datos tratamos y para qué</h2>
      <p>Email, nombre y los textos que cargás (comentarios, encuestas, notas, testimonios), con la única finalidad de generar avatares ficticios de cliente ideal. No pedimos datos sensibles.</p>
      <h2>Transferencia internacional</h2>
      <p>Los datos se alojan en Supabase y el texto se procesa con la API de Claude (Anthropic, EE. UU.). Solo se transfieren con tu consentimiento expreso.</p>
      <h2>Tus derechos</h2>
      <p>Podés acceder, rectificar, actualizar y suprimir tus datos escribiendo a {TITULAR.email}.</p>
      <p className="text-sm">{LEYENDA_AAIP}</p>
    </PaginaLegal>
  );
}
