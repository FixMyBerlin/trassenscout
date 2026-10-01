import { z } from "zod"
import { GeometryTypeEnum, LocationEnum } from "@/src/prisma/generated/browser"
import { MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"
import { SubsubsectionExtraFieldsValuesSchema } from "@/src/shared/subsubsections/extraFieldSchemas"

const nonEmptyString = z.string().min(1, {
  error: "MCP cannot clear fields with empty string. Omit the key to leave the value unchanged.",
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
})

export const subsubsectionMcpPatchSchema = subsubsectionMcpPatchObjectSchema.strict()

const subsubsectionMcpCreatePatchObjectSchema = subsubsectionMcpPatchObjectSchema.extend({
  type: z.enum(GeometryTypeEnum).optional(),
})

const subsubsectionMcpCreatePatchSchema = subsubsectionMcpCreatePatchObjectSchema.strict()

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
