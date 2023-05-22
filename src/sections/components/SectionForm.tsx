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
      />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Teilstrecken"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung."
      />
      <LabeledTextField type="text" name="title" label="Name" />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField type="text" name="start" label="Startpunkt" />
        <LabeledTextField type="text" name="end" label="Endpunkt" />
      </div>
      <LabeledSelect name="labelPos" label="Kartenlabelposition" options={labelPosOptions} />
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
