import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { quote } from "src/core/components/text"
import { getUserSelectOptions, UserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: UserSelectOptions }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Bspw. ${quote("RF1")} oder ${quote(
          "SF2a"
        )}. Primäre Auszeichnung der Führung. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Führung"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie (mit Unterbrechungen) mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung. Sonderführungen bitte zwischen die Regelführungen einsortieren."
      />
      <LabeledTextField type="text" name="subTitle" label="Untertitel" optional />
      <LabeledSelect
        name="type"
        label="Führungsform"
        options={[
          ["ROUTE", "Regelführung (RF) – Linie"],
          ["AREA", "Sonderführung (SF) – Punkt"],
        ]}
      />
      <LabeledGeometryField name="geometry" label="Geometry (`LineString` oder `Point`)" />
      <LabeledSelect
        name="labelPos"
        label="Kartenlabel Position"
        options={[
          ["top", "Oben (Pfeil unten)"],
          ["topRight", "Oben rechts"],
          ["right", "Rechts (Pfeil links)"],
          ["bottomRight", "Unten rechts"],
          ["bottom", "Unten (Pfeil oben)"],
          ["bottomLeft", "Unten links"],
          ["left", "Links (Pfeil rechts)"],
          ["topLeft", "Open links"],
        ]}
      />
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
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
