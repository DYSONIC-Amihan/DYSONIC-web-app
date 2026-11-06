"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { ROUTES } from "@/lib/routes"

// UI guard only. The real check must happen in DYSONIC-api on every request.
// Reuse it in any layout: <RoleGuard allow={(roleId) => ...}>
export function RoleGuard({
  allow,
  children,
}: {
  allow: (roleId: number | null | undefined) => boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const allowed = allow(session?.user.roleId)

  useEffect(() => {
    if (!isPending && session && !allowed) router.replace(ROUTES.dashboard)
  }, [isPending, session, allowed, router])

  if (isPending || !allowed) return null

  return <>{children}</>
}