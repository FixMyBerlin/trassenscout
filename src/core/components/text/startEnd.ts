import { Section, Subsection } from "@prisma/client"
import { Prettify } from "src/core/types"

type Input =
  | Prettify<
      Omit<Partial<Section>, "start" | "end"> &
        Required<Pick<Section, "start">> &
        Required<Pick<Section, "end">>
    >
  | Prettify<
      Omit<Partial<Subsection>, "start" | "end"> &
        Required<Pick<Subsection, "start">> &
        Required<Pick<Subsection, "end">>
    >

export const startEnd = (object: Input) => {
  return `${object.start} ▸ ${object.end}`
}
