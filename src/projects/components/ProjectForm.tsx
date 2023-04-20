import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { Link } from "src/core/components/links"
import { getFullname } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function ProjectForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    users: {
      id: number
      firstName: string | null
      lastName: string | null
      email: string
    }[]
  }
) {
  const { users } = props

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
      <LabeledTextField type="text" name="shortTitle" label="Kurzname" placeholder="" />
      <LabeledTextField
        optional
        type="text"
        name="logoSrc"
        label="Logo"
        placeholder="beispiel.png"
      />
      <p className="mt-2 text-sm text-gray-500">
        Das Logo wird von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p>
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledTextareaField
        optional
        name="partnerLogoSrcs"
        label="Partner-Logos (ein Logo pro Zeile)"
        placeholder="beispiel.png"
      />
      <p className="mt-2 text-sm text-gray-500">
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
        options={users.map((u) => [u.id.toString(), [getFullname(u), `<${u.email}>`].join(" ")])}
      />
    </Form>
  )
}
