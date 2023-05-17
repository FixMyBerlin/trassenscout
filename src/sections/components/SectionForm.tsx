import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { getUserSelectOptions, UserSelectOptions } from "src/users/utils"
import { z } from "zod"
import { labelPosOptions } from "src/form"
export { FORM_ERROR } from "src/core/components/forms"

export function SectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: UserSelectOptions }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="URL-Segment"
        help="Änderungen am URL-Segement sorgen dafür, dass bisherige URLs nicht mehr funktionieren."
        placeholder=""
      />
      <LabeledTextField type="number" name="index" label="Index und Reihenfolge" placeholder="" />
      <LabeledTextField type="text" name="title" label="Name" placeholder="" />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField type="text" name="start" label="Startpunkt" placeholder="" />
        <LabeledTextField type="text" name="end" label="Endpunkt" placeholder="" />
      </div>
      <LabeledSelect name="labelPos" label="Kartenlabelposition" options={labelPosOptions} />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledTextField type="text" name="length" label="Länge (in km)" optional placeholder="" />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
