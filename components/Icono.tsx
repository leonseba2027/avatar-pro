import {
  Sparkles, GraduationCap, Crown, Handshake, Megaphone, Search,
  Target, Rocket, Heart, Lightbulb, Users, Briefcase, type LucideProps,
} from "lucide-react";

const MAPA = {
  sparkles: Sparkles, "graduation-cap": GraduationCap, crown: Crown,
  handshake: Handshake, megaphone: Megaphone, search: Search, target: Target,
  rocket: Rocket, heart: Heart, lightbulb: Lightbulb, users: Users, briefcase: Briefcase,
};

export function Icono({ nombre, ...props }: { nombre: string } & LucideProps) {
  const C = MAPA[nombre as keyof typeof MAPA] ?? Sparkles;
  return <C aria-hidden="true" {...props} />;
}
