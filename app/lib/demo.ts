export const DEMO_STUDENT_EMAIL = process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL ?? "demo.estudiante@coffeebiocharacademy.com";
export const DEMO_ADMIN_EMAIL   = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL   ?? "demo.admin@coffeebiocharacademy.com";
export const DEMO_PASSWORD      = process.env.NEXT_PUBLIC_DEMO_PASSWORD      ?? "CoffeeDemo2025!";

export function getDemoRole(email: string | null | undefined): "student" | "admin" | null {
  if (email === DEMO_STUDENT_EMAIL) return "student";
  if (email === DEMO_ADMIN_EMAIL)   return "admin";
  return null;
}
