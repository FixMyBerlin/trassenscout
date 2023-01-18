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

      {/* <LabeledCheckboxGroup
        items={["irrelevant", "pending", "inprogress", "done"].map((item) => ({
          name: `checkbox${item}help`,
          label: `Test Checkbox ${item}`,
          help: `Help text ${item}`,
        }))}
      /> */}

      {/* <LabeledRadiobuttonGroup
        items={["item1", "item2", "item3"].map((item) => ({
          scope: "help",
          name: `radio${item}help`,
          label: `Test Radiobutton ${item}`,
          help: `Help text ${item}`,
        }))}
      /> */}

      <LabeledSelect
        name="sectionId"
        label="Teilstrecke"
        options={[
          ["1", "1"],
          ["2", "2"],
        ]}
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
