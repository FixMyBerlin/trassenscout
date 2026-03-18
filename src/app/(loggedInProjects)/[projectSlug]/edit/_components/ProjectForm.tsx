"use client"

import {
  Form,
  FormProps,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

export const ProjectForm = (props: Props) => {
  return (
    <Form {...props}>
      {(form) => (
        <>
          <LabeledTextField
            form={form}
            type="text"
            name="slug"
            label="Kürzel"
            help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
          />
          <LabeledTextField form={form} type="text" name="subTitle" label="Untertitel" optional />
          <LabeledTextareaField
            form={form}
            name="description"
            label="Beschreibung (Markdown)"
            optional
          />
        </>
      )}
    </Form>
  )
}
