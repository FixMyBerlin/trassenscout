"use client"

import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import {
  getUserSelectOptions,
  UserSelectOptions,
} from "@/src/pagesComponents/users/utils/getUserSelectOptions"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>> & { users: UserSelectOptions }

export const ProjectForm = ({ users, ...props }: Props) => {
  return (
    <Form {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurztitel"
        help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
      />
      <LabeledTextField type="text" name="subTitle" label="Untertitel" optional />
      {/* UNUSED */}
      {/* <LabeledTextField
        optional
        type="text"
        name="logoSrc"
        label="Logo"
        placeholder="beispiel.png"
      /> */}
      {/* <p className="mt-1! text-sm text-gray-500">
        Das Logo wird von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p> */}
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      {/* UNUSED */}
      {/* <LabeledTextareaField
        optional
        name="partnerLogoSrcs"
        label="Partner-Logos (ein Logo pro Zeile)"
        placeholder="beispiel.png"
      />
      <p className="mt-1! text-sm text-gray-500">
        Die Logos werden von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p> */}
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        optional
        options={getUserSelectOptions(users)}
        help="Wir geben dieser Nutzer:in automatisch Zugriffsrechte auf dem Projekt"
      />
    </Form>
  )
}
