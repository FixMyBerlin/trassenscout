import { Form, FormProps, LabeledTextareaField, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function CalendarEntryForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props} className="max-w-prose">
      <LabeledTextField type="text" name="title" label="Title" placeholder="" />
      <LabeledTextField
        type="datetime-local"
        name="startAt"
        label="Start Datum und Zeit"
        placeholder=""
      />
      <LabeledTextField
        type="text"
        name="locationName"
        optional
        label="Ort"
        placeholder="Beispielsweise Adresse und Bezeichnung des Konferenzraums"
      />
      <LabeledTextField
        type="text"
        name="locationUrl"
        optional
        label="Online Meeting URL"
        placeholder="Beispielsweise Adresse und Bezeichnung des Konferenzraums"
      />
      <LabeledTextareaField
        name="description"
        optional
        label="Beschreibung (Markdown)"
        placeholder=""
        className="h-60"
      />
    </Form>
  )
}
