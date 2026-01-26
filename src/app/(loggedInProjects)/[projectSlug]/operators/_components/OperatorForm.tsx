"use client"

import { Form, FormProps, LabeledTextField } from "@/src/core/components/forms"
import { z } from "zod"

export function OperatorForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      <LabeledTextField type="text" name="slug" label="Kürzel" />
      <LabeledTextField type="text" name="title" label="Titel" />
      <LabeledTextField
        type="number"
        name="order"
        label="Reihenfolge"
        help="Die Reihenfolge wird lediglich für die Sortierung der Baulastträger in der Liste und auf der Karte verwendet."
      />
    </Form>
  )
}
