import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        roleId: { type: "number", required: false, input: false },
      },
    }),
  ],
  fetchOptions: { credentials: "include" },
})
