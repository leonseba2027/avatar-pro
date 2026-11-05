export type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  icono: string;
  orden: number;
};

// Colores con contraste AA (≥ 4.5:1) sobre blanco
export const COLORES = [
  { valor: "#7c3aed", nombre: "Violeta" },
  { valor: "#0369a1", nombre: "Celeste" },
  { valor: "#b45309", nombre: "Ámbar" },
  { valor: "#047857", nombre: "Verde" },
  { valor: "#be185d", nombre: "Rosa" },
  { valor: "#4338ca", nombre: "Índigo" },
  { valor: "#b91c1c", nombre: "Rojo" },
  { valor: "#0f766e", nombre: "Turquesa" },
  { valor: "#374151", nombre: "Gris" },
];

export const ICONOS = [
  "sparkles", "graduation-cap", "crown", "handshake", "megaphone", "search",
  "target", "rocket", "heart", "lightbulb", "users", "briefcase",
] as const;
