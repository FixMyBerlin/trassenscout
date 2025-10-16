import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { StatusStyleEnum } from "@prisma/client"
import { z } from "zod"

export function SubsectionStatusForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      <LabeledTextField type="text" name="slug" label="Kurz-Titel und URL-Teil" />
      <LabeledTextField type="text" name="title" label="Titel" />
      <LabeledRadiobuttonGroup
        label="Darstellung"
        scope="style"
        items={Object.entries(StatusStyleEnum).map(([key, value]) => ({ value, label: value }))}
        classNameItemWrapper="flex gap-5 !space-y-0 items-center"
      />
    </Form>
  )
}
