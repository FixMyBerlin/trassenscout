import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { InviteSchema } from "@/src/shared/invites/schemas"

export const GetInvitesSchema = ProjectSlugRequiredSchema.extend({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().max(100).optional(),
})

export const CreateInviteSchema = ProjectSlugRequiredSchema.extend(InviteSchema.shape)
