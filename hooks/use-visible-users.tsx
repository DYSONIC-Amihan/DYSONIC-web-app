"use client"

import { useEffect, useMemo, useState } from "react"

import { authClient } from "@/lib/auth-client"
import { listUsers, type ManagedUser } from "@/lib/api/users"
import { canViewUser } from "@/lib/roles"

// Loads users and keeps only the ones the signed-in person is allowed to see.
export function useVisibleUsers() {
  const { data: session } = authClient.useSession()
  const actorId = session?.user.id
  const actorRoleId = session?.user.roleId

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listUsers()
      .then((data) => {
        if (cancelled) return
        setUsers(data)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError("Couldn't load users. Please try again.")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visibleUsers = useMemo(() => {
    if (!actorId) return []
    return users.filter((user) =>
      canViewUser({ id: actorId, roleId: actorRoleId }, user),
    )
  }, [users, actorId, actorRoleId])

  return { users: visibleUsers, loading, error }
}