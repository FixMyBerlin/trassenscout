import { z } from "zod"

export const ProjectSchema = z.object({
  name: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  shortName: z.string().nullish(),
  introduction: z.string().nullish(),
  managerId: z.coerce.number(),
})
