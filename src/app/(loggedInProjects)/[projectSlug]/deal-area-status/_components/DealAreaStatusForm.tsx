import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"
import { dealAreaStatusStyleOptions } from "../_utils/dealAreaStatusStyleUi"

export const DealAreaStatusFormSchema = z.object({
  slug: z.string().min(1, { message: "Pflichtfeld." }),
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal("1"), z.literal("2"), z.literal("3")]),
})

export function DealAreaStatusForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="slug" label="Kürzel" />
      <LabeledTextField type="text" name="title" label="Titel" />
      <LabeledRadiobuttonGroup
        label="Darstellung"
        scope="style"
        items={dealAreaStatusStyleOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        classNameItemWrapper="flex gap-5 space-y-0! items-center"
      />
    </Form>
  )
}
