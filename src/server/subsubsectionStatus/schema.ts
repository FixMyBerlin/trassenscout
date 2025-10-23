import { SlugSchema } from "@/src/core/utils"
import { StatusStyleEnum } from "@prisma/client"
import { z } from "zod"

export const SubsubsectionStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.nativeEnum(StatusStyleEnum),
  projectId: z.coerce.number(),
})

type TSubsubsectionStatus = z.infer<typeof SubsubsectionStatus>
