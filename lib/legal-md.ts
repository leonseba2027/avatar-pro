import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { TITULAR, VERSION_TEXTOS_LEGALES, FECHA_TEXTOS_LEGALES } from "./legal";

// Los textos legales viven en /legales/*.md para que un abogado los pueda editar directamente
export function textoLegal(archivo: string) {
  const md = readFileSync(path.join(process.cwd(), "legales", archivo), "utf8")
    .replaceAll("{{NOMBRE}}", TITULAR.nombre).replaceAll("{{CUIT}}", TITULAR.cuit)
    .replaceAll("{{DOMICILIO}}", TITULAR.domicilio).replaceAll("{{EMAIL}}", TITULAR.email)
    .replaceAll("{{VERSION}}", VERSION_TEXTOS_LEGALES).replaceAll("{{FECHA}}", FECHA_TEXTOS_LEGALES);
  return marked.parse(md, { async: false }) as string;
}
