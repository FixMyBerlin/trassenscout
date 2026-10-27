import { z } from "zod"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"

const nonEmptyString = z.string().min(1, {
  error:
    "MCP rejects empty strings. Omit the key to leave the value unchanged. On update, reset a text field (description, estimatedCompletionDateString) by listing it in clear.",
})

const subsectionMcpIdentitySchema = z.object({
  projectSlug: z.string().min(1),
  slug: z.string().min(1).describe("Planungsabschnitt Kürzel"),
})

/** String fields MCP may reset; "" and null stay rejected so a reset is always named in `clear`. */
export const SUBSECTION_MCP_CLEARABLE_KEYS = [
  "description",
  "estimatedCompletionDateString",
] as const

const subsectionMcpPatchObjectSchema = z.object({
  description: nonEmptyString.optional(),
  lengthM: z.number().optional(),
  estimatedCompletionDateString: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { error: "Datum im Format JJJJ-MM" })
    .optional(),
  operatorSlug: nonEmptyString.optional(),
  networkHierarchySlug: nonEmptyString.optional(),
  subsectionStatusSlug: nonEmptyString.optional(),
  geometry: SupportedGeometrySchema.optional(),
  clear: z
    .array(z.enum(SUBSECTION_MCP_CLEARABLE_KEYS))
    .min(1, { error: "Omit clear instead of sending an empty array." })
    .optional()
    .describe(
      `Fields to reset to empty. Only these: ${SUBSECTION_MCP_CLEARABLE_KEYS.join(", ")}. Do not also send the same field in the patch.`,
    ),
})

export const subsectionMcpPatchSchema = subsectionMcpPatchObjectSchema.strict()

// A new Planungsabschnitt has nothing to clear
const subsectionMcpCreatePatchObjectSchema = subsectionMcpPatchObjectSchema
  .omit({ clear: true })
  .extend({
    type: z.enum([GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON]).optional(),
  })

const subsectionMcpCreatePatchSchema = subsectionMcpCreatePatchObjectSchema.strict()

/** Update overlay: writable scalars, relations, and geometry (no type). */
export const subsectionMcpPatchOverlaySchema = subsectionMcpPatchObjectSchema

/** Create overlay: includes type and geometry. */
export const subsectionMcpCreatePatchOverlaySchema = subsectionMcpCreatePatchObjectSchema

export type SubsectionMcpPatch = z.infer<typeof subsectionMcpPatchSchema>
export type SubsectionMcpCreatePatch = z.infer<typeof subsectionMcpCreatePatchSchema>

const subsectionMcpUpdateItemSchema = subsectionMcpIdentitySchema.extend({
  patch: subsectionMcpPatchSchema,
})

export const subsectionMcpUpdateInputSchema = z.object({
  items: z.array(subsectionMcpUpdateItemSchema).min(1).max(MCP_LIST_MAX_LIMIT),
})

const subsectionMcpCreateItemSchema = subsectionMcpIdentitySchema.extend({
  patch: subsectionMcpCreatePatchSchema,
})

export const subsectionMcpCreateInputSchema = z.object({
  items: z.array(subsectionMcpCreateItemSchema).min(1).max(MCP_LIST_MAX_LIMIT),
})

export const subsectionMcpDeleteInputSchema = z.object({
  items: z.array(subsectionMcpIdentitySchema).min(1).max(MCP_LIST_MAX_LIMIT),
  confirm: z
    .boolean()
    .optional()
    .describe(
      "Omit or false: preview only, writes nothing. true: delete items with no remaining Maßnahmen.",
    ),
})
