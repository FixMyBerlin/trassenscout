import { z } from "zod"

export const StakeholdernoteSchema = z.object({
  name: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  statusText: z.string().nullish(),
  status: z.enum(["irrelevant", "pending", "inprogress", "done"]),
  //enum?
})
