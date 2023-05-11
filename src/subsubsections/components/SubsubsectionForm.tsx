import { Form, FormProps, LabeledTextareaField, LabeledTextField } from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
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
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledGeometryField
        name="geometry"
        label="Geometry (`LineString` oder `Point`)"
        placeholder=""
      />
      <LabeledTextField
        type="text"
        name="guidance"
        label="Führungsform"
        help="Führungsform"
        placeholder=""
      />
      <LabeledTextField
        type="text"
        name="task"
        label="Massnahmentyp"
        help="Massnahmentyp"
        placeholder=""
      />
      <LabeledTextField
        type="number"
        step="0.001"
        name="length"
        label="Länge (in km)"
        optional
        placeholder=""
      />
      <LabeledTextField
        type="number"
        step="0.01"
        name="width"
        label="Breite (in m)"
        optional
        placeholder=""
      />
    </Form>
  )
}
