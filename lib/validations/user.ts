import { z } from "zod"

import { ROLE_IDS } from "@/lib/roles"

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a name")
    .max(60, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  roleId: z.union([z.literal(ROLE_IDS.admin), z.literal(ROLE_IDS.normal)], {
    message: "Choose a role",
  }),
})

export type UserFormInput = z.infer<typeof userFormSchema>