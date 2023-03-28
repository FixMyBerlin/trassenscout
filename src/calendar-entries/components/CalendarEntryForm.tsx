import { Form, FormProps, LabeledTextareaField, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function CalendarEntryForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props} className="max-w-prose">
      <LabeledTextField type="text" name="title" label="Titel" placeholder="" />
      <div className="flex gap-4">
        <LabeledTextField type="date" name="startDate" label="Start-Datum" placeholder="" />
        <LabeledTextField type="time" name="startTime" label="und -Zeit" placeholder="" />
      </div>
      <LabeledTextField type="text" name="locationName" optional label="Ort" placeholder="" />
      <LabeledTextField
        type="url"
        name="locationUrl"
        optional
        label="Besprechungslink"
        placeholder=""
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
