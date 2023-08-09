import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { LabeledRadiobuttonGroupLabelPos } from "src/core/components/forms/LabeledRadiobuttonGroupLabelPos"
import { quote } from "src/core/components/text"
import { getUserSelectOptions, UserSelectOptions } from "src/users/utils"
import { z } from "zod"
import { GeometryInput } from "./GeometryInput/GeometryInput"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: UserSelectOptions },
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Bspw. ${quote("rf1")} oder ${quote(
          "sf2a",
        )}. Primäre Auszeichnung der Führung. Wird immer in Großschreibung angezeigt aber in Kleinschreibung editiert. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField type="text" name="subTitle" label="Title" optional />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Führung"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie (mit Unterbrechungen) mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung. Sonderführungen bitte zwischen die Regelführungen einsortieren."
      />
      <GeometryInput />
      <LabeledRadiobuttonGroupLabelPos />
      <LabeledTextField
        type="text"
        name="task"
        label="Massnahmentyp"
        help="Bspw. 'Fahrbahnmarkierung'"
      />
      <LabeledTextField
        type="number"
        step="0.001"
        name="length"
        label="Länge (in Kilometer)"
        optional
      />
      <LabeledTextField type="number" step="0.01" name="width" label="Breite (in Meter)" optional />
      <LabeledTextField
        type="number"
        step="1"
        name="costEstimate"
        label="Kostenschätzung (in Euro)"
        optional
      />
      <LabeledTextField
        type="text"
        name="mapillaryKey"
        label="Mapillary Bild Referenz"
        optional
        help="Die Mapillary Bild Referenz kann aus der URL als 'pKey' kopiert werden. Das ausgewählte Bild wird dann als eingebettete Vorschau auf der Seite angezeigt."
      />
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        optional
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
