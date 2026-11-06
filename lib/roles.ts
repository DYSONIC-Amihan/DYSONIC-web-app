export const ROLE_IDS = {
  admin: 1,
  normal: 2,
  superAdmin: 3,
} as const

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS]

export const ROLE_LABELS: Record<RoleId, string> = {
  [ROLE_IDS.admin]: "Admin",
  [ROLE_IDS.normal]: "Normal user",
  [ROLE_IDS.superAdmin]: "Super admin",
}

export type AssignableRoleId = typeof ROLE_IDS.admin | typeof ROLE_IDS.normal

export function isRoleId(value: unknown): value is RoleId {
  return (
    typeof value === "number" &&
    (Object.values(ROLE_IDS) as number[]).includes(value)
  )
}

/**
 * PERMISSIONS (single source of truth for the UI)
 * DYSONIC-api must enforce the same rules on every request.
 *
 * To change who can do what, edit these two tables only.
 */

// Roles each role can see and manage in the users table.
const MANAGEABLE_ROLES: Record<RoleId, readonly RoleId[]> = {
  [ROLE_IDS.superAdmin]: [ROLE_IDS.superAdmin, ROLE_IDS.admin, ROLE_IDS.normal],
  [ROLE_IDS.admin]: [ROLE_IDS.normal],
  [ROLE_IDS.normal]: [],
}

// Roles each role can give to someone. Super admins are created manually
// (seed script / database), never through the app.
const ASSIGNABLE_ROLES: Record<RoleId, readonly AssignableRoleId[]> = {
  [ROLE_IDS.superAdmin]: [ROLE_IDS.admin, ROLE_IDS.normal],
  [ROLE_IDS.admin]: [ROLE_IDS.normal],
  [ROLE_IDS.normal]: [],
}

export type Actor = { id: string; roleId: number | null | undefined }

export function canAccessUserManagement(roleId: number | null | undefined) {
  return isRoleId(roleId) && MANAGEABLE_ROLES[roleId].length > 0
}

export function getAssignableRoleIds(
  roleId: number | null | undefined,
): readonly AssignableRoleId[] {
  return isRoleId(roleId) ? ASSIGNABLE_ROLES[roleId] : []
}

// Can this actor see this user in the table?
export function canViewUser(actor: Actor, target: { roleId: number }) {
  return (
    isRoleId(actor.roleId) &&
    (MANAGEABLE_ROLES[actor.roleId] as readonly number[]).includes(target.roleId)
  )
}

// Can this actor edit, suspend or delete this user?
export function canManageUser(actor: Actor, target: { id: string; roleId: number }) {
  if (actor.id === target.id) return false // never act on your own account
  return canViewUser(actor, target)
}

// Roles whose accounts this role can see (used for dashboard stats).
export function getVisibleRoleIds(
  roleId: number | null | undefined,
): readonly RoleId[] {
  return isRoleId(roleId) ? MANAGEABLE_ROLES[roleId] : []
}