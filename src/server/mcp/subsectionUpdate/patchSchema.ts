import { z } from "zod"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"

const nonEmptyString = z.string().min(1, {
  error: "MCP cannot clear fields with empty string. Omit the key to leave the value unchanged.",
})

const subsectionMcpIdentitySchema = z.object({
  projectSlug: z.string().min(1),
  slug: z.string().min(1).describe("Planungsabschnitt Kürzel"),
})

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
})

export const subsectionMcpPatchSchema = subsectionMcpPatchObjectSchema.strict()

const subsectionMcpCreatePatchObjectSchema = subsectionMcpPatchObjectSchema.extend({
  type: z.enum([GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON]).optional(),
  geometry: SupportedGeometrySchema.optional(),
})

const subsectionMcpCreatePatchSchema = subsectionMcpCreatePatchObjectSchema.strict()

/** Update overlay: writable scalars/relations only (no geometry/type). */
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
