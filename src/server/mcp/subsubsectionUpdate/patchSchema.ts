import { z } from "zod"
import { GeometryTypeEnum, LocationEnum } from "@/src/prisma/generated/browser"
import { MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"
import { SubsubsectionExtraFieldsValuesSchema } from "@/src/shared/subsubsections/extraFieldSchemas"

const nonEmptyString = z.string().min(1, {
  error:
    "MCP rejects empty strings. Omit the key to leave the value unchanged. On update, reset a text field (description, estimatedConstructionDateString, extraFields.<key>) by listing it in clear.",
})

/** ISO calendar date as a string so MCP `tools/list` can emit JSON Schema (Zod Date cannot). */
const mcpIsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}([Tt].*)?$/, {
    error: "Use an ISO date (YYYY-MM-DD).",
  })
  .describe("ISO date YYYY-MM-DD")

const subsubsectionMcpIdentitySchema = z.object({
  projectSlug: z.string().min(1),
  subsectionSlug: z.string().min(1).describe("Planungsabschnitt slug"),
  slug: z.string().min(1).describe("Maßnahme slug"),
})

/** String fields MCP may reset; "" and null stay rejected so a reset is always named in `clear`. */
export const SUBSUBSECTION_MCP_CLEARABLE_KEYS = [
  "description",
  "estimatedConstructionDateString",
] as const

const EXTRA_FIELD_PATH_PREFIX = "extraFields."

/** `extraFields.<key>`, how patch fields and `clear` address one extra field. */
type SubsubsectionMcpExtraFieldPath = `${typeof EXTRA_FIELD_PATH_PREFIX}${string}`

export function isExtraFieldPath(field: string): field is SubsubsectionMcpExtraFieldPath {
  return field.startsWith(EXTRA_FIELD_PATH_PREFIX)
}

export function extraFieldKey(path: SubsubsectionMcpExtraFieldPath) {
  return path.slice(EXTRA_FIELD_PATH_PREFIX.length)
}

const subsubsectionMcpClearSchema = z
  .array(
    z.union([
      z.enum(SUBSUBSECTION_MCP_CLEARABLE_KEYS),
      z.templateLiteral([EXTRA_FIELD_PATH_PREFIX, z.string().min(1)], {
        error: `Clearable fields: ${SUBSUBSECTION_MCP_CLEARABLE_KEYS.join(", ")}, extraFields.<key>.`,
      }),
    ]),
  )
  .min(1, { error: "Omit clear instead of sending an empty array." })
  .describe(
    `Fields to reset to empty. Only these: ${SUBSUBSECTION_MCP_CLEARABLE_KEYS.join(", ")}, extraFields.<key>. Do not also send the same field in the patch.`,
  )

const subsubsectionMcpPatchObjectSchema = z.object({
  description: nonEmptyString.optional(),
  location: z.enum(LocationEnum).optional(),
  lengthM: z.number().optional(),
  width: z.number().optional(),
  costEstimate: z.number().optional(),
  isExistingInfra: z.boolean().optional(),
  maxSpeed: z.number().optional(),
  trafficLoad: z.number().optional(),
  trafficLoadDate: mcpIsoDate.optional(),
  planningPeriod: z.number().optional(),
  constructionPeriod: z.number().optional(),
  estimatedCompletionDate: mcpIsoDate.optional(),
  estimatedConstructionDateString: z
    .string()
    .regex(/^(\d{4})$/, { error: "Datum im Format JJJJ" })
    .optional(),
  planningCosts: z.number().min(0).optional(),
  deliveryCosts: z.number().min(0).optional(),
  constructionCosts: z.number().min(0).optional(),
  landAcquisitionCosts: z.number().min(0).optional(),
  expensesOfficialOrders: z.number().min(0).optional(),
  expensesTechnicalVerification: z.number().min(0).optional(),
  nonEligibleExpenses: z.number().min(0).optional(),
  grantAmount: z.number().min(0).optional(),
  ownFunds: z.number().min(0).optional(),
  grantsOtherFunding: z.number().min(0).optional(),
  revenuesEconomicIncome: z.number().min(0).optional(),
  contributionsThirdParties: z.number().min(0).optional(),
  remainingFunding: z.number().min(0).optional(),
  disbursedFunding: z.number().min(0).optional(),
  qualityLevelSlug: nonEmptyString.optional(),
  subsubsectionStatusSlug: nonEmptyString.optional(),
  subsubsectionTaskSlug: nonEmptyString.optional(),
  subsubsectionInfraSlug: nonEmptyString.optional(),
  subsubsectionInfrastructureTypeSlugs: z
    .array(z.string().min(1))
    .min(1, {
      error:
        "MCP cannot clear subsubsectionInfrastructureTypeSlugs with an empty array. Omit the key to leave the value unchanged.",
    })
    .optional(),
  extraFields: SubsubsectionExtraFieldsValuesSchema.optional(),
  geometry: SupportedGeometrySchema.optional(),
  clear: subsubsectionMcpClearSchema.optional(),
})

export const subsubsectionMcpPatchSchema = subsubsectionMcpPatchObjectSchema.strict()

const subsubsectionMcpCreatePatchObjectSchema = subsubsectionMcpPatchObjectSchema.extend({
  type: z.enum(GeometryTypeEnum).optional(),
  withoutGeometry: z
    .literal(true)
    .optional()
    .describe("Create the Maßnahme without geometry. Do not send type or geometry with it."),
})

// A new Maßnahme has nothing to clear
const subsubsectionMcpCreatePatchSchema = subsubsectionMcpCreatePatchObjectSchema
  .omit({ clear: true })
  .strict()

/** Overlay drops unknown keys instead of rejecting the whole patch. */
export const subsubsectionMcpPatchOverlaySchema = subsubsectionMcpCreatePatchObjectSchema

export type SubsubsectionMcpPatch = z.infer<typeof subsubsectionMcpPatchSchema>
export type SubsubsectionMcpCreatePatch = z.infer<typeof subsubsectionMcpCreatePatchSchema>

const subsubsectionMcpUpdateItemSchema = subsubsectionMcpIdentitySchema.extend({
  patch: subsubsectionMcpPatchSchema,
})

export const subsubsectionMcpUpdateInputSchema = z.object({
  items: z.array(subsubsectionMcpUpdateItemSchema).min(1).max(MCP_LIST_MAX_LIMIT),
})

const subsubsectionMcpCreateItemSchema = subsubsectionMcpIdentitySchema.extend({
  patch: subsubsectionMcpCreatePatchSchema,
})

export const subsubsectionMcpCreateInputSchema = z.object({
  items: z.array(subsubsectionMcpCreateItemSchema).min(1).max(MCP_LIST_MAX_LIMIT),
})

export const subsubsectionMcpDeleteInputSchema = z.object({
  items: z.array(subsubsectionMcpIdentitySchema).min(1).max(MCP_LIST_MAX_LIMIT),
  confirm: z
    .boolean()
    .optional()
    .describe(
      "Omit or false: preview only, writes nothing. true: delete items that have no protocols, uploads, or acquisition areas.",
    ),
})

export const acquisitionAreaMcpDeleteInputSchema = z.object({
  items: z.array(subsubsectionMcpIdentitySchema).min(1).max(MCP_LIST_MAX_LIMIT),
  confirm: z
    .boolean()
    .optional()
    .describe(
      "Omit or false: preview only, writes nothing. true: delete all acquisition areas of each Maßnahme that has none with protocols or uploads.",
    ),
})
