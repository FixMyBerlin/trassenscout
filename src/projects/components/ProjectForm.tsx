import { Form, FormProps, LabeledTextareaField, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function ProjectForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="name" label="Name" placeholder="" />
      <LabeledTextField type="text" name="shortName" label="Kurzname" placeholder="" optional />
      <LabeledTextareaField
        name="introduction"
        label="Introduction (Markdown)"
        placeholder=""
        optional
      />
      <LabeledTextField
        type="number"
        name="userId"
        label="Projektleiter:in"
        placeholder=""
        optional
      />
      {/*
        <LabeledSelect
          name="testSelect"
          label="Test Select"
          options={[
            ["foo", "Foo 1"],
            ["bar", "Bar 1"],
          ]}
        />
      */}
    </Form>
  )
}
