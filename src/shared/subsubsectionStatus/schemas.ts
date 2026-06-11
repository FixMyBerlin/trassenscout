import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import { SubsubsectionStatusStyleEnum } from "@/src/prisma/generated/browser"

export const SubsubsectionStatusSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.enum(SubsubsectionStatusStyleEnum),
  projectId: z.coerce.number(),
})

export const subsubsectionStatusFormDefaultValues: z.infer<typeof SubsubsectionStatusSchema> = {
  slug: "",
  title: "",
  style: SubsubsectionStatusStyleEnum.REGULAR,
  projectId: 0,
}
