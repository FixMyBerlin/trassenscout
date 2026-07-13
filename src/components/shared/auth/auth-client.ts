import { customSessionClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { Auth } from "@/src/server/auth/types"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_ORIGIN,
  plugins: [customSessionClient<Auth>(), inferAdditionalFields<Auth>()],
})
