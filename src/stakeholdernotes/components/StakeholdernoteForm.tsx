import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function StakeholdernoteForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="title" label="Name" placeholder="" />

      <LabeledTextareaField
        name="statusText"
        label="Beschreibung des Status (Markdown)"
        placeholder=""
      />
      <LabeledSelect
        name="status"
        label="Status"
        options={[
          ["irrelevant", "irrelevant"],
          ["pending", "ausstehend"],
          ["inprogress", "in Arbeit"],
          ["done", "erledigt"],
        ]}
      />
    </Form>
  )
}
