import { z } from "zod"

export const StakeholdernoteSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  statusText: z.string().nullish(),
  status: z.enum(["IRRELEVANT", "PENDING", "IN_PROGRESS", "DONE"]),
  subsectionId: z.coerce.number(),
})

export const StakeholdernoteMultiSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
})
