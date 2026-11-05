import { PaginaLegal } from "@/components/PaginaLegal";
import { FormularioTramite } from "./FormularioTramite";

export const metadata = { title: "Botón de arrepentimiento" };

export default function Arrepentimiento() {
  return (
    <PaginaLegal archivo="boton-de-arrepentimiento.md">
      <FormularioTramite />
    </PaginaLegal>
  );
}
