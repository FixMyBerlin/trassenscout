import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { Stakeholdernote } from "@prisma/client"
import { z } from "zod"
import { stakeholderNotesStatus } from "./stakeholdernotesStatus"
import { StakeholderSectionListItemStatus } from "./StakeholderSectionListItemStatus"

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
          label: <StakeholderSectionListItemStatus status={key as Stakeholdernote["status"]} />,
        }))}
      />
    </Form>
  )
}
