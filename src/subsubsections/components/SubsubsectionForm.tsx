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
  console.log({ props })

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="URL-Segment"
        help="Änderungen am URL-Segement sorgen dafür, dass bisherige URLs nicht mehr funktionieren."
        placeholder=""
      />
      <LabeledTextField type="text" name="title" label="Name" placeholder="" />
      <LabeledSelect
        name="type"
        label="Führungsform"
        options={[
          ["ROUTE", "Regelführung Strecke (RF)"],
          ["AREA", "Sonderführung Punkt/Fläche (SF)"],
        ]}
      />
      <LabeledGeometryField
        name="geometry"
        label="Geometry (`LineString` oder `Point`)"
        placeholder=""
      />
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
        placeholder=""
      />
      <LabeledTextField
        type="number"
        step="0.001"
        name="length"
        label="Länge (in Kilometer)"
        optional
        placeholder=""
      />
      <LabeledTextField
        type="number"
        step="0.01"
        name="width"
        label="Breite (in Meter)"
        optional
        placeholder=""
      />
      <LabeledTextField
        type="number"
        step="1"
        name="costEstimate"
        label="Kostenschätzung (in Euro)"
        optional
        placeholder=""
      />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
