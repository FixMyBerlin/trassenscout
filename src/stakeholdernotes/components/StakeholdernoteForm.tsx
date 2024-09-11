import { Stakeholdernote } from "@prisma/client"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { z } from "zod"
import { stakeholderNotesStatus } from "./stakeholdernotesStatus"
import { ListItemStatus } from "./StakeholderSectionListItemStatus"
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
        items={Object.keys(stakeholderNotesStatus).map((key) => ({
          value: key,
          label: <ListItemStatus status={key as Stakeholdernote["status"]} />,
        }))}
      />
    </Form>
  )
}
