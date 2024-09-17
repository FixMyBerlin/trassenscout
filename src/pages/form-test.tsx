import {
  Form,
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { LayoutArticle, MetaTags } from "@/src/core/layouts"

export default function FormTest() {
  const handleSubmit = async (values: any) => {
    try {
      await Promise.reject()
    } catch (error: any) {
      alert(JSON.stringify({ values }, undefined, 2))
      return {
        testText: "error testText",
        testNumber: "error testNumber",
        testPasswort: "error testPasswort",
        testEMail: "error testEMail",
        testTextarea: "error testTextarea",
        checkboxitem1regular: "error test",
        checkboxitem1help: "error test",
        radioitem1regular: "error test",
        radioitem1help: "error test",
        testSelect: "error testSelect",
      }
    }
  }

  return (
    <LayoutArticle>
      <MetaTags noindex title="Kontakt & Impressum" />
      <h1>FormTest</h1>
      <Form onSubmit={handleSubmit} submitText="Submit button text">
        <LabeledTextField
          name="testText"
          label="Test Text Label"
          placeholder="Placeholder"
          type="text"
        />
        <LabeledTextField
          name="testNumber"
          label="Test Number Label"
          placeholder="Placeholder"
          type="number"
        />
        <LabeledTextField
          name="testPasswort"
          label="Test Passwort Label"
          placeholder="Placeholder"
          type="password"
        />
        <LabeledTextField
          name="testEMail"
          label="Test EMail Label"
          placeholder="Placeholder"
          type="email"
        />
        <LabeledTextareaField name="testTextarea" label="Test Textarea" placeholder="Placeholder" />
        <LabeledCheckboxGroup
          scope="regular-check"
          items={["item1", "item2", "item3"].map((item) => ({
            value: `test${item}value`,
            label: `Test Checkbox ${item}`,
          }))}
        />
        <LabeledCheckboxGroup
          label="LabeledCheckboxGroup with help"
          scope="help-check"
          items={["item1", "item2", "item3"].map((item) => ({
            value: `test${item}value`,
            label: `Test Checkbox ${item}`,
            help: `Help text ${item}`,
          }))}
        />
        <LabeledCheckboxGroup
          label="LabeledCheckboxGroup Readonly"
          scope="readonly-check"
          items={["item1"].map((item) => ({
            value: `test${item}value`,
            label: `Test Checkbox ${item}`,
            readonly: true,
          }))}
        />
        <hr />
        <LabeledRadiobuttonGroup
          scope="regular-radio"
          items={["item1", "item2", "item3"].map((item) => ({
            value: `test${item}value`,
            label: `Test Radiobutton ${item}`,
          }))}
        />
        <LabeledRadiobuttonGroup
          scope="help-radio"
          label="LabeledRadiobuttonGroup with help in columns"
          classNameItemWrapper="columns-2"
          items={["item1", "item2", "item3"].map((item) => ({
            value: `test${item}value`,
            label: `Test Radiobutton ${item}`,
            help: `Help text ${item}`,
          }))}
        />
        <LabeledRadiobuttonGroup
          label="LabeledRadiobuttonGroup Readonly"
          scope="readonly-radio"
          items={["item1"].map((item) => ({
            value: `test${item}value`,
            label: `Test Radiobutton ${item}`,
            readonly: true,
          }))}
        />
        <hr />
        <LabeledSelect
          name="testSelect"
          label="Test Select"
          options={[
            ["foo", "Foo 1"],
            ["bar", "Bar 1"],
          ]}
        />
      </Form>
    </LayoutArticle>
  )
}
