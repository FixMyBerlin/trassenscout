import { z } from "zod"
import { LocationEnum } from "@/src/prisma/generated/browser"
import { SubsubsectionExtraFieldsValuesSchema } from "@/src/shared/subsubsections/extraFieldSchemas"

const nonEmptyString = z.string().min(1, {
  error: "MCP cannot clear fields with empty string. Omit the key to leave the value unchanged.",
})

const subsubsectionMcpIdentitySchema = z.object({
  projectSlug: z.string().min(1),
  subsectionSlug: z.string().min(1).describe("Planungsabschnitt slug"),
  slug: z.string().min(1).describe("Maßnahme slug"),
})

export const subsubsectionMcpPatchSchema = z
  .object({
    description: nonEmptyString.optional(),
    location: z.enum(LocationEnum).optional(),
    lengthM: z.number().optional(),
    width: z.number().optional(),
    costEstimate: z.number().optional(),
    isExistingInfra: z.boolean().optional(),
    maxSpeed: z.number().optional(),
    trafficLoad: z.number().optional(),
    trafficLoadDate: z.coerce.date().optional(),
    planningPeriod: z.number().optional(),
    constructionPeriod: z.number().optional(),
    estimatedCompletionDate: z.coerce.date().optional(),
    estimatedConstructionDateString: z
      .string()
      .regex(/^(\d{4})$/, { error: "Datum im Format JJJJ" })
      .optional(),
    planningCosts: z.number().optional(),
    deliveryCosts: z.number().optional(),
    constructionCosts: z.number().optional(),
    landAcquisitionCosts: z.number().optional(),
    expensesOfficialOrders: z.number().optional(),
    expensesTechnicalVerification: z.number().optional(),
    nonEligibleExpenses: z.number().optional(),
    revenuesEconomicIncome: z.number().optional(),
    contributionsThirdParties: z.number().optional(),
    grantsOtherFunding: z.number().optional(),
    ownFunds: z.number().optional(),
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
  })
  .strict()

export type SubsubsectionMcpPatch = z.infer<typeof subsubsectionMcpPatchSchema>

export const subsubsectionMcpPreviewInputSchema = subsubsectionMcpIdentitySchema.extend({
  patch: subsubsectionMcpPatchSchema,
})

export const subsubsectionMcpUpdateInputSchema = subsubsectionMcpPreviewInputSchema.extend({
  confirm: z.boolean(),
})
