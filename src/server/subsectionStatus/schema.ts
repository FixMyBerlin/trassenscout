import { SlugSchema } from "@/src/core/utils/schema-shared"
import { SubsectionStatusStyleEnum } from "@prisma/client"
import { z } from "zod"

export const SubsectionStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.nativeEnum(SubsectionStatusStyleEnum),
  projectId: z.coerce.number(),
})

type TSubsectionStatus = z.infer<typeof SubsectionStatus>
