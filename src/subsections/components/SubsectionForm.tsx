import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { quote } from "src/core/components/text"
import { labelPosOptions } from "src/form"
import { getUserSelectOptions, UserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: UserSelectOptions }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Bspw. ${quote(
          "pa1"
        )}. Primäre Auszeichnung des Planungsabschnitts. Wird immer in Großschreibung angezeigt aber in Kleinschreibung editiert. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Planungsabschnitte"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung."
      />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField type="text" name="start" label="Startpunkt" />
        <LabeledTextField type="text" name="end" label="Endpunkt" />
      </div>
      <LabeledSelect name="labelPos" label="Kartenlabelposition" options={labelPosOptions} />
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledGeometryField name="geometry" label="Geometry (LineString)" />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
