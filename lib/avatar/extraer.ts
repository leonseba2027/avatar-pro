import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

export const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (límite de Vercel: 4,5 MB por solicitud)
export const MAX_CARACTERES = 200_000;    // por fuente
export const EXTENSIONES = [".txt", ".csv", ".pdf"];

// Convierte un archivo .txt, .csv o .pdf a texto plano
export async function extraerTexto(archivo: File): Promise<string> {
  const nombre = archivo.name.toLowerCase();
  if (archivo.size > MAX_BYTES) throw new Error("El archivo supera los 4 MB.");
  if (!EXTENSIONES.some((e) => nombre.endsWith(e))) throw new Error("Solo se aceptan archivos .txt, .csv o .pdf.");

  const buffer = new Uint8Array(await archivo.arrayBuffer());
  if (nombre.endsWith(".pdf")) {
    if (String.fromCharCode(...buffer.slice(0, 5)) !== "%PDF-") throw new Error("El PDF no es válido.");
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    if (!text.trim()) throw new Error("El PDF no tiene texto seleccionable (¿es una imagen escaneada?).");
    return text;
  }
  const texto = new TextDecoder("utf-8").decode(buffer);
  if (nombre.endsWith(".csv")) {
    // Cada fila como una línea "columna: valor" para que se entienda mejor
    const filas = texto.split(/\r?\n/).filter((l) => l.trim());
    const sep = (filas[0]?.match(/;/g)?.length ?? 0) > (filas[0]?.match(/,/g)?.length ?? 0) ? ";" : ",";
    const dividir = (l: string) => l.split(new RegExp(`${sep}(?=(?:[^"]*"[^"]*")*[^"]*$)`)).map((c) => c.replace(/^"|"$/g, "").trim());
    const cab = dividir(filas[0] ?? "");
    return filas.slice(1).map((f, i) => `Respuesta ${i + 1}: ` + dividir(f).map((v, j) => `${cab[j] ?? `col${j + 1}`}: ${v}`).join(" | ")).join("\n");
  }
  return texto;
}
