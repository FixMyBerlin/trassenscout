import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import {
  createAdminApiToken,
  listAdminApiTokens,
  revokeAdminApiToken,
} from "@/src/server/admin/adminApiTokens.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { getNumericUserId } from "@/src/server/auth/shared/getNumericUserId"

export const getAdminApiTokensLoaderFn = createServerFn({ method: "GET" }).handler(async () => {
  await endpointAuth.admin(getRequestHeaders())
  const tokens = await listAdminApiTokens()
  return { tokens }
})

const CreateAdminApiTokenInput = z.object({ name: z.string().min(1) })

export const createAdminApiTokenFn = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof CreateAdminApiTokenInput>) =>
    CreateAdminApiTokenInput.parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await endpointAuth.admin(getRequestHeaders())
    const { token, row } = await createAdminApiToken({
      name: data.name,
      createdById: getNumericUserId(admin.userId),
    })
    return { token, id: row.id, name: row.name }
  })

const RevokeAdminApiTokenInput = z.object({ id: z.string() })

export const revokeAdminApiTokenFn = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof RevokeAdminApiTokenInput>) =>
    RevokeAdminApiTokenInput.parse(data),
  )
  .handler(async ({ data }) => {
    await endpointAuth.admin(getRequestHeaders())
    try {
      await revokeAdminApiToken(data.id)
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2025") {
        throw new Error("API-Token nicht gefunden")
      }
      throw error
    }
    return { ok: true }
  })
