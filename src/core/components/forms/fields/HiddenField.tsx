"use client"

import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import { PropsWithoutRef } from "react"

export type HiddenFieldProps = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["input"]>,
  "type" | "value" | "onChange" | "readOnly"
>

export function HiddenField(props: HiddenFieldProps) {
  const field = useFieldContext<string>()

  return (
    <input
      readOnly
      type="hidden"
      id={field.name}
      {...props}
      value={String(field.state.value ?? "")}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )
}
