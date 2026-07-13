import { z } from "zod"

export const GetUsersAdminSchema = z.object({})
export const GetUsersWithMembershipsSchema = z.object({})

export const GetUserWithMembershipsSchema = z.object({
  userId: z.coerce.number().int().positive(),
})
