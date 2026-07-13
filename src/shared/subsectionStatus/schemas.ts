import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import { SubsectionStatusStyleEnum } from "@/src/prisma/generated/browser"

export const SubsectionStatusSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.enum(SubsectionStatusStyleEnum),
  projectId: z.coerce.number(),
})

export const subsectionStatusFormDefaultValues: z.infer<typeof SubsectionStatusSchema> = {
  slug: "",
  title: "",
  style: SubsectionStatusStyleEnum.REGULAR,
  projectId: 0,
}
