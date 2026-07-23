import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { CreateInvitesSchema as SharedCreateInvitesSchema } from "@/src/shared/invites/schemas"

export const GetInvitesSchema = ProjectSlugRequiredSchema.extend({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().max(100).optional(),
})

export const CreateInvitesSchema = SharedCreateInvitesSchema

export const RevokeInviteSchema = ProjectSlugRequiredSchema.extend({
  inviteId: z.number().int().positive(),
})

export const GetInviteEmailStatusSchema = z.object({
  email: z.email(),
})
