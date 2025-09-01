"use client"

import { Form, FormProps, LabeledTextareaField } from "@/src/core/components/forms"
import { z } from "zod"

export function ProtocolEmailForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      <div className="space-y-6">
        <LabeledTextareaField
          name="text"
          label="E-Mail-Inhalt"
          rows={15}
          placeholder="E-Mail-Inhalt einfügen..."
        />
      </div>
    </Form>
  )
}
