import { Badge } from "@/components/ui/badge"
import { ROLE_IDS, ROLE_LABELS, type RoleId } from "@/lib/roles"
import type { UserStatus } from "@/lib/api/users"

export function RoleBadge({ roleId }: { roleId: RoleId }) {
  const variant =
    roleId === ROLE_IDS.superAdmin
      ? "default"
      : roleId === ROLE_IDS.admin
        ? "secondary"
        : "outline"

  return <Badge variant={variant}>{ROLE_LABELS[roleId]}</Badge>
}

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  unverified: "Unverified",
  suspended: "Suspended",
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const variant =
    status === "suspended"
      ? "destructive"
      : status === "unverified"
        ? "secondary"
        : "outline"

  return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>
}