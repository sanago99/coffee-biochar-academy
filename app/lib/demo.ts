export const DEMO_STUDENT_EMAIL = "demo.estudiante@coffeebiocharcademy.com";
export const DEMO_ADMIN_EMAIL   = "demo.admin@coffeebiocharcademy.com";
// Set NEXT_PUBLIC_DEMO_PASSWORD in .env.local to match the password you created in Firebase Auth
export const DEMO_PASSWORD      = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "CoffeeDemo2025!";

export function getDemoRole(email: string | null | undefined): "student" | "admin" | null {
  if (email === DEMO_STUDENT_EMAIL) return "student";
  if (email === DEMO_ADMIN_EMAIL)   return "admin";
  return null;
}
