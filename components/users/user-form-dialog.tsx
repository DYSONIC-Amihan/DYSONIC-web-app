"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ManagedUser } from "@/lib/api/users"
import { ROLE_LABELS, isRoleId, type AssignableRoleId } from "@/lib/roles"
import { getFieldErrors } from "@/lib/validations/auth"
import { userFormSchema, type UserFormInput } from "@/lib/validations/user"

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // undefined = create mode, a user = edit mode
  user?: ManagedUser
  // Roles the signed-in person is allowed to give out
  assignableRoleIds: readonly AssignableRoleId[]
  onSubmit: (values: UserFormInput) => Promise<void>
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  assignableRoleIds,
  onSubmit,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Rendered only while open, so its state resets every time. */}
        <UserForm
          user={user}
          assignableRoleIds={assignableRoleIds}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function UserForm({
  user,
  assignableRoleIds,
  onSubmit,
  onCancel,
}: {
  user?: ManagedUser
  assignableRoleIds: readonly AssignableRoleId[]
  onSubmit: (values: UserFormInput) => Promise<void>
  onCancel: () => void
}) {
  const isEdit = !!user
  const roleItems = assignableRoleIds.map((id) => ({
    value: String(id),
    label: ROLE_LABELS[id],
  }))
  const [roleId, setRoleId] = useState(() => {
    const current = user ? String(user.roleId) : undefined
    return roleItems.find((item) => item.value === current)?.value ?? roleItems.at(-1)?.value ?? ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const numericRole = Number(roleId)
    const parsed = userFormSchema.safeParse({
      name: formData.get("name"),
      // Email can't change when editing, so reuse the stored one.
      email: isEdit ? user.email : formData.get("email"),
      roleId: isRoleId(numericRole) ? numericRole : undefined,
    })

    if (!parsed.success) {
      setErrors(getFieldErrors(parsed.error))
      return
    }
    setErrors({})

    setPending(true)
    try {
      await onSubmit(parsed.data)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this person's name or role."
            : "They'll get an email to verify their account and set a password."}
        </DialogDescription>
      </DialogHeader>

      <FieldGroup className="py-4">
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="user-name">Name</FieldLabel>
          <Input
            id="user-name"
            name="name"
            autoComplete="off"
            defaultValue={user?.name}
            aria-invalid={!!errors.name}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="user-email">Email</FieldLabel>
          <Input
            id="user-email"
            name="email"
            type="email"
            autoComplete="off"
            defaultValue={user?.email}
            disabled={isEdit}
            aria-invalid={!!errors.email}
          />
          {isEdit && (
            <FieldDescription>Email can't be changed here.</FieldDescription>
          )}
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.roleId}>
          <FieldLabel htmlFor="user-role">Role</FieldLabel>
          <Select
            items={roleItems}
            value={roleId}
            onValueChange={(value) => setRoleId(value ?? "")}
          >
            <SelectTrigger id="user-role" className="w-full">
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {roleItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roleId && <FieldError>{errors.roleId}</FieldError>}
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : isEdit ? "Save changes" : "Add user"}
        </Button>
      </DialogFooter>
    </form>
  )
}