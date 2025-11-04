import { parseAsJson, useQueryState } from "nuqs"
import { z } from "zod"

export const initialFormValuesSchema = z.object({
  subsubsectionId: z.number().optional(),
})

export type InitialFormValuesSchema = z.infer<typeof initialFormValuesSchema>

export const useInitialFormValues = () => {
  const [initialFormValues, setInitialFormValues] = useQueryState(
    "initialValues",
    parseAsJson(initialFormValuesSchema.parse),
  )
  return { initialFormValues, setInitialFormValues }
}
