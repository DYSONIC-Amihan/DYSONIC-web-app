import { ROLE_IDS, type RoleId } from "@/lib/roles"
import type { UserFormInput } from "@/lib/validations/user"

export type UserStatus = "active" | "unverified" | "suspended"

export type ManagedUser = {
  id: string
  name: string
  email: string
  image: string | null
  roleId: RoleId
  status: UserStatus
  createdAt: string // ISO date
}

//Japake lang toh

/**
 * MOCK DATA LAYER
 * When DYSONIC-api has the endpoints, replace the bodies with fetch calls
 * (credentials: "include") and keep the signatures the same:
 *
 *   GET    /admin/users            -> listUsers
 *   POST   /admin/users            -> createUser
 *   PATCH  /admin/users/:id        -> updateUser
 *   PATCH  /admin/users/:id/status -> setUserStatus
 *   DELETE /admin/users/:id        -> deleteUser
 */

let users: ManagedUser[] = [
  u("1", "Maria Santos", "maria.santos@example.com", ROLE_IDS.superAdmin, "active", "2026-08-02"),
  u("2", "Jose Reyes", "jose.reyes@example.com", ROLE_IDS.admin, "active", "2026-08-15"),
  u("3", "Ana Dela Cruz", "ana.delacruz@example.com", ROLE_IDS.admin, "active", "2026-09-01"),
  u("4", "Paolo Garcia", "paolo.garcia@example.com", ROLE_IDS.normal, "active", "2026-09-04"),
  u("5", "Liza Mendoza", "liza.mendoza@example.com", ROLE_IDS.normal, "unverified", "2026-09-12"),
  u("6", "Carlo Bautista", "carlo.bautista@example.com", ROLE_IDS.normal, "active", "2026-09-18"),
  u("7", "Jasmine Cruz", "jasmine.cruz@example.com", ROLE_IDS.normal, "suspended", "2026-09-22"),
  u("8", "Miguel Ramos", "miguel.ramos@example.com", ROLE_IDS.normal, "active", "2026-10-01"),
  u("9", "Bea Villanueva", "bea.villanueva@example.com", ROLE_IDS.normal, "active", "2026-10-06"),
  u("10", "Rafael Aquino", "rafael.aquino@example.com", ROLE_IDS.normal, "unverified", "2026-10-11"),
  u("11", "Kristine Flores", "kristine.flores@example.com", ROLE_IDS.admin, "suspended", "2026-10-15"),
  u("12", "Daniel Torres", "daniel.torres@example.com", ROLE_IDS.normal, "active", "2026-10-21"),
  u("13", "Hannah Navarro", "hannah.navarro@example.com", ROLE_IDS.normal, "active", "2026-10-28"),
  u("14", "Ethan Castillo", "ethan.castillo@example.com", ROLE_IDS.normal, "active", "2026-11-03"),
]

function u(
  id: string,
  name: string,
  email: string,
  roleId: RoleId,
  status: UserStatus,
  createdAt: string,
): ManagedUser {
  return { id, name, email, image: null, roleId, status, createdAt }
}

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listUsers(): Promise<ManagedUser[]> {
  await delay()
  return [...users]
}

export async function createUser(input: UserFormInput): Promise<ManagedUser> {
  await delay()
  if (users.some((x) => x.email === input.email)) {
    throw new Error("A user with this email already exists.")
  }
  const created: ManagedUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    image: null,
    roleId: input.roleId,
    status: "unverified",
    createdAt: new Date().toISOString(),
  }
  users = [created, ...users]
  return created
}

export async function updateUser(
  id: string,
  input: Pick<UserFormInput, "name" | "roleId">,
): Promise<ManagedUser> {
  await delay()
  const existing = users.find((x) => x.id === id)
  if (!existing) throw new Error("User not found.")
  const updated = { ...existing, ...input }
  users = users.map((x) => (x.id === id ? updated : x))
  return updated
}

export async function setUserStatus(
  id: string,
  status: Extract<UserStatus, "active" | "suspended">,
): Promise<ManagedUser> {
  await delay()
  const existing = users.find((x) => x.id === id)
  if (!existing) throw new Error("User not found.")
  const updated = { ...existing, status }
  users = users.map((x) => (x.id === id ? updated : x))
  return updated
}

export async function deleteUser(id: string): Promise<void> {
  await delay()
  users = users.filter((x) => x.id !== id)
}