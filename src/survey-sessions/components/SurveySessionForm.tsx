import { Form, FormProps } from "@/src/core/components/forms"
import { z } from "zod"

export function SurveySessionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      {/*
        <LabeledTextField type="text" name="name" label="Name" placeholder="Name" />

        <LabeledTextareaField name="testTextarea" label="Test Textarea" placeholder="Placeholder" />

        <LabeledCheckboxGroup
          items={["item1", "item2", "item3"].map((item) => ({
            name: `checkbox${item}help`,
            label: `Test Checkbox ${item}`,
            help: `Help text ${item}`,
          }))}
        />

        <LabeledRadiobuttonGroup
          items={["item1", "item2", "item3"].map((item) => ({
            scope: "help",
            name: `radio${item}help`,
            label: `Test Radiobutton ${item}`,
            help: `Help text ${item}`,
          }))}
        />

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
