import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
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
      <LabeledRadiobuttonGroup
        scope="status"
        label="Status"
        items={[
          { value: "IRRELEVANT", label: "nicht erforderlich" },
          { value: "PENDING", label: "ausstehend" },
          { value: "IN_PROGRESS", label: "in Arbeit" },
          { value: "DONE", label: "erledigt" },
        ]}
      />
    </Form>
  )
}
