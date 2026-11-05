"use client";
import { useEffect, useState } from "react";

// Paleta validada (CVD-safe) para series categóricas; tonos claros/oscuros elegidos por modo
export const CATEGORICOS = {
  claro: ["#2a78d6", "#eb6834", "#1baf7a"],
  oscuro: ["#3987e5", "#d95926", "#199e70"],
};
// Escala ordinal (ingresos bajo → alto)
export const ORDINAL = { claro: ["#86b6ef", "#2a78d6", "#104281"], oscuro: ["#184f95", "#3987e5", "#b7d3f6"] };
// Estados (siempre acompañados de ícono + texto)
export const ESTADO = { bueno: "#0ca30c", advertencia: "#fab219", serio: "#ec835a", critico: "#d03b3b" };
export const TINTA = {
  claro: { primaria: "#111827", secundaria: "#4b5563", grilla: "#e5e7eb", base: "#c3c2b7", superficie: "#ffffff" },
  oscuro: { primaria: "#f3f4f6", secundaria: "#b6bccb", grilla: "#2c3550", base: "#3a4566", superficie: "#151b2e" },
};

export function useOscuro() {
  const [oscuro, setOscuro] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const leer = () => setOscuro(el.classList.contains("dark"));
    leer();
    const mo = new MutationObserver(leer);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return oscuro;
}

// En modo oscuro aclara el color del servicio para que la marca contraste con el fondo
export function colorSerie(hex: string, oscuro: boolean) {
  if (!oscuro) return hex;
  const n = parseInt(hex.slice(1), 16);
  const mezcla = (c: number) => Math.round(c + (255 - c) * 0.45);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mezcla);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
