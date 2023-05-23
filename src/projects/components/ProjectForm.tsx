import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { Link } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { getUserSelectOptions, UserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function ProjectForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: UserSelectOptions }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Empfohlenes Format: ${quote(
          "RS99"
        )}. Primäre Auszeichnung der Trasse. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField type="text" name="subTitle" label="Untertitel" optional />
      <LabeledTextField
        optional
        type="text"
        name="logoSrc"
        label="Logo"
        placeholder="beispiel.png"
      />
      <p className="!mt-1 text-sm text-gray-500">
        Das Logo wird von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p>
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledTextareaField
        optional
        name="partnerLogoSrcs"
        label="Partner-Logos (ein Logo pro Zeile)"
        placeholder="beispiel.png"
      />
      <p className="!mt-1 text-sm text-gray-500">
        Die Logos werden von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p>
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}
