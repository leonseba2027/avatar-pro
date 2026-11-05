import { PaginaLegal } from "@/components/PaginaLegal";
import { TITULAR } from "@/lib/legal";
export const metadata = { title: "Botón de arrepentimiento" };
export default function A() {
  return (
    <PaginaLegal titulo="Botón de arrepentimiento">
      <p>Según la Resolución 424/2020 de la Secretaría de Comercio Interior, podés revocar la aceptación de tu compra o suscripción dentro de los <strong>10 días corridos</strong> desde la contratación, sin costo ni explicación.</p>
      <p>El formulario automático con número de trámite se habilita junto con los pagos (Etapa 6). Mientras tanto, escribí a <strong>{TITULAR.email}</strong> indicando tu email de cuenta.</p>
    </PaginaLegal>
  );
}
