import {
  Form,
  FormProps,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

export const EmailTemplateForm = ({ supportsCta, ...props }: Props & { supportsCta: boolean }) => {
  return (
    <Form {...props}>
      <LabeledTextField type="text" name="subject" label="Subject" />
      <LabeledTextareaField name="introMarkdown" label="Intro Markdown" rows={10} />
      <LabeledTextareaField name="outroMarkdown" label="Outro Markdown" rows={8} optional />
      {supportsCta ? (
        <LabeledTextField type="text" name="ctaText" label="CTA Text" optional />
      ) : (
        <LabeledTextField
          type="text"
          name="ctaText"
          label="CTA Text"
          optional
          disabled
          help="Dieser E-Mail-Typ hat aktuell keinen CTA-Link."
        />
      )}
    </Form>
  )
}
