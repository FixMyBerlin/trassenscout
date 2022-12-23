import {
  Form,
  LabeledCheckbox,
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LayoutArticle, MetaTags } from "src/core/layouts"

export default function PageFormTest() {
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
          items={["item1", "item2", "item3"].map((item) => ({
            name: `checkbox${item}regular`,
            label: `Test Checkbox ${item}`,
          }))}
        />
        <LabeledCheckboxGroup
          items={["item1", "item2", "item3"].map((item) => ({
            name: `checkbox${item}help`,
            label: `Test Checkbox ${item}`,
            help: `Help text ${item}`,
          }))}
        />
        <LabeledRadiobuttonGroup
          items={["item1", "item2", "item3"].map((item) => ({
            scope: "regular",
            name: `radio${item}regular`,
            label: `Test Radiobutton ${item}`,
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
      </Form>
    </LayoutArticle>
  )
}
