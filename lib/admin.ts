import "server-only";
// Emails del titular que pueden ver /admin (variable ADMIN_EMAILS en Vercel, separados por coma)
export const esAdmin = (email?: string | null) =>
  !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
