import { Prettify } from "@/src/core/types"
import { Subsection } from "@prisma/client"

type Input = Prettify<
  Omit<Partial<Subsection>, "start" | "end"> &
    Required<Pick<Subsection, "start">> &
    Required<Pick<Subsection, "end">>
>

export const startEnd = (object: Input) => {
  return `${object.start} - ${object.end}`
}
