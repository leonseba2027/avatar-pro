import { PaginaLegal } from "@/components/PaginaLegal";
import { TITULAR } from "@/lib/legal";
export const metadata = { title: "Términos y condiciones" };
export default function T() {
  return (
    <PaginaLegal titulo="Términos y condiciones">
      <h2>Titular del servicio</h2>
      <p>{TITULAR.nombre}, CUIT {TITULAR.cuit}, con domicilio en {TITULAR.domicilio}. Email: {TITULAR.email}.</p>
      <h2>Objeto</h2>
      <p>Avatar Pro es una herramienta para construir perfiles ficticios y generales de cliente ideal a partir de información que carga el usuario.</p>
      <h2>Precios, arrepentimiento y baja</h2>
      <p>Los precios se informan en pesos argentinos, finales e impuestos incluidos. Podés revocar la contratación dentro de los 10 días corridos (art. 34, Ley 24.240) desde el Botón de arrepentimiento, y darte de baja por el mismo medio por el que te diste de alta.</p>
      <h2>Ley aplicable</h2>
      <p>Leyes de la República Argentina.</p>
    </PaginaLegal>
  );
}
