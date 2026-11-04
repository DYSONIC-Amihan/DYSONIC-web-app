export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
} as const

export const PROTECTED_PREFIXES: string[] = [ROUTES.dashboard]

export function getSafeRedirect(
  next: string | null | undefined,
  fallback: string = ROUTES.dashboard,
) {
  if (!next) return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback
  }
  return next
}