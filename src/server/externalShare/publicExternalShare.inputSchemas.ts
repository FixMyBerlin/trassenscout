import { z } from "zod"

// generateSecureToken: 32 bytes as base64url
export const ExternalShareTokenSchema = z.string().regex(/^[\w-]{43}$/)

// Unknown tokens must still reach the server and end in the same 404 as revoked ones.
export const GetPublicExternalShareSchema = z.object({ token: z.string() })

export const ExternalShareUploadParamsSchema = z.object({
  token: ExternalShareTokenSchema,
  // Postgres int4: larger ids would fail in the database instead of returning 404.
  uploadId: z.coerce.number().int().positive().max(2_147_483_647),
})
