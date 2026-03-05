import { SlugSchema } from "@/src/core/utils/schema-shared"
import { SubsubsectionStatusStyleEnum } from "@prisma/client"
import { z } from "zod"

export const SubsubsectionStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.nativeEnum(SubsubsectionStatusStyleEnum),
  projectId: z.coerce.number(),
})

type TSubsubsectionStatus = z.infer<typeof SubsubsectionStatus>
