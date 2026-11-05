import { Facebook, Instagram, Linkedin, MessageCircle, Music2, Twitter, Youtube, Globe } from "lucide-react";

const RED: Record<string, { nombre: string; I: typeof Globe }> = {
  instagram: { nombre: "Instagram", I: Instagram }, facebook: { nombre: "Facebook", I: Facebook },
  linkedin: { nombre: "LinkedIn", I: Linkedin }, tiktok: { nombre: "TikTok", I: Music2 },
  youtube: { nombre: "YouTube", I: Youtube }, x: { nombre: "X (Twitter)", I: Twitter },
  whatsapp: { nombre: "WhatsApp", I: MessageCircle }, otra: { nombre: "Otras", I: Globe },
};

export function Redes({ datos }: { datos: { red: string; porcentaje: number }[] }) {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {datos.map((d) => {
        const r = RED[d.red] ?? RED.otra;
        return (
          <li key={d.red} className="flex flex-col items-center rounded-xl bg-suave p-3 text-center">
            <r.I size={28} aria-hidden="true" />
            <span className="mt-1 text-xl font-bold">{d.porcentaje}%</span>
            <span className="text-xs text-tenue">{r.nombre}</span>
          </li>
        );
      })}
    </ul>
  );
}
