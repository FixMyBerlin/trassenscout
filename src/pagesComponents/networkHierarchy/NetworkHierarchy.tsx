import { Form, FormProps, LabeledTextField } from "@/src/core/components/forms"
import { z } from "zod"

export function NetworkHierarchyForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      <LabeledTextField type="text" name="slug" label="Kürzel" />
      <LabeledTextField type="text" name="title" label="Titel" />
    </Form>
  )
}
