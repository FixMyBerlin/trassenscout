import { Form, FormProps, LabeledTextField } from "@/src/core/components/forms"
import { z } from "zod"

export function SubsubsectionInfraForm<S extends z.ZodType<any, any>>(
  props: Omit<FormProps<S>, "children">,
) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      {(form) => (
        <>
          <LabeledTextField form={form} type="text" name="slug" label="Kürzel" />
          <LabeledTextField form={form} type="text" name="title" label="Titel" />
        </>
      )}
    </Form>
  )
}
