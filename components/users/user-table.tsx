"use client"

import { useEffect, useMemo, useState } from "react"
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShieldBanIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import {
  createUser,
  deleteUser,
  listUsers,
  setUserStatus,
  updateUser,
  type ManagedUser,
  type UserStatus,
} from "@/lib/api/users"
import {
  ROLE_LABELS,
  canManageUser,
  canViewUser,
  getAssignableRoleIds,
} from "@/lib/roles"
import type { UserFormInput } from "@/lib/validations/user"
import { RoleBadge, StatusBadge } from "@/components/users/role-badge"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


const PAGE_SIZE = 8

const statusItems = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "unverified", label: "Unverified" },
  { value: "suspended", label: "Suspended" },
]

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function UsersTable() {
  const { data: session } = authClient.useSession()
  const actor = session?.user
  const assignableRoleIds = getAssignableRoleIds(actor?.roleId)
  // Role tabs only make sense when there is more than one role to filter by.
  const roleTabs = [
    { value: "all", label: "All" },
    ...assignableRoleIds.map((id) => ({
      value: String(id),
      label: ROLE_LABELS[id],
    })),
  ]
  const showRoleTabs = assignableRoleIds.length > 1

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | undefined>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [deleting, setDeleting] = useState(false)

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
        setLoadError("Couldn't load users. Please try again.")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((user) => {
      if (!actor || !canViewUser({ id: actor.id, roleId: actor.roleId }, user)) return false
      if (roleFilter !== "all" && String(user.roleId) !== roleFilter) return false
      if (statusFilter !== "all" && user.status !== statusFilter) return false
      if (
        q &&
        !user.name.toLowerCase().includes(q) &&
        !user.email.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [users, actor, search, roleFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )
  const from = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1
  const to = Math.min((safePage + 1) * PAGE_SIZE, filtered.length)

  function openCreate() {
    setEditingUser(undefined)
    setFormOpen(true)
  }

  function openEdit(user: ManagedUser) {
    setEditingUser(user)
    setFormOpen(true)
  }

  function openDelete(user: ManagedUser) {
    setDeleteTarget(user)
    setDeleteOpen(true)
  }

  async function handleFormSubmit(values: UserFormInput) {
    if (editingUser) {
      const updated = await updateUser(editingUser.id, {
        name: values.name,
        roleId: values.roleId,
      })
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      toast.success(`${updated.name} was updated.`)
    } else {
      const created = await createUser(values)
      setUsers((prev) => [created, ...prev])
      toast.success(`${created.name} was added.`)
    }
    setFormOpen(false)
  }

  async function handleToggleSuspend(user: ManagedUser) {
    const next = user.status === "suspended" ? "active" : "suspended"
    try {
      const updated = await setUserStatus(user.id, next)
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      toast.success(
        next === "suspended"
          ? `${user.name} was suspended.`
          : `${user.name} was reactivated.`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      toast.success(`${deleteTarget.name} was deleted.`)
      setDeleteOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {showRoleTabs && (
          <Tabs
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(String(value))
              setPage(0)
            }}
          >
            <TabsList>
              {roleTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
          <div className="relative sm:w-64">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder="Search name or email"
              aria-label="Search users"
              className="pl-8"
            />
          </div>

          <Select
            items={statusItems}
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? "all")
              setPage(0)
            }}
          >
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={openCreate}>
            <PlusIcon />
            Add user
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">
                  {loadError}
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users match your filters.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((user) => {
                const isSelf = user.id === actor?.id
                const manageable =
                  !!actor && canManageUser({ id: actor.id, roleId: actor.roleId }, user)

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {user.image && <AvatarImage src={user.image} alt={user.name} />}
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid leading-tight">
                          <span className="font-medium">
                            {user.name}
                            {isSelf && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge roleId={user.roleId} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status as UserStatus} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      {manageable && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" />}
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Actions for {user.name}</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <PencilIcon />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleSuspend(user)}>
                              {user.status === "suspended" ? (
                                <>
                                  <ShieldCheckIcon />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <ShieldBanIcon />
                                  Suspend
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDelete(user)}
                            >
                              <Trash2Icon />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pager */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length === 0
            ? "0 users"
            : `Showing ${from}–${to} of ${filtered.length}`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= pageCount - 1}
          >
            Next
          </Button>
        </div>
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        assignableRoleIds={assignableRoleIds}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the account and its access. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}