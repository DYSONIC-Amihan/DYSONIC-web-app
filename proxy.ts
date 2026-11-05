import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { PROTECTED_PREFIXES, ROUTES } from "@/lib/routes"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isProtected && !getSessionCookie(request)) {
    const url = new URL(ROUTES.login, request.url)
    url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
