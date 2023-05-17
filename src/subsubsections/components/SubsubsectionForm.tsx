import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
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
        label="URL-Segment"
        help="Änderungen am URL-Segement sorgen dafür, dass bisherige URLs nicht mehr funktionieren."
      />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Führung"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie (mit Unterbrechungen) mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung. Sonderfürungen Punkt/Fläche zwischen die Regelführungen Strecke einsortieren."
      />
      <LabeledTextField type="text" name="title" label="Name" />
      <LabeledSelect
        name="type"
        label="Führungsform"
        options={[
          ["ROUTE", "Regelführung Strecke (RF)"],
          ["AREA", "Sonderführung Punkt/Fläche (SF)"],
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
