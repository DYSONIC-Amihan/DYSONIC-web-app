"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function RedirectIfAuthed({ to }: { to: string }) {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session) router.replace(to)
  }, [session, to, router])

  return null
}