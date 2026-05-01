import {
  Form,
  FormProps,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

export const EmailTemplateForm = (props: Props) => {
  return (
    <Form {...props}>
      <LabeledTextField type="text" name="subject" label="Subject" />
      <LabeledTextareaField name="introMarkdown" label="Intro Markdown" rows={10} />
      <LabeledTextareaField name="outroMarkdown" label="Outro Markdown" rows={8} optional />
      <LabeledTextField type="text" name="ctaText" label="CTA Text" optional />
    </Form>
  )
}
