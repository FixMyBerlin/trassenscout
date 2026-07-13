import type { JSX } from "react"
import { PropsWithoutRef } from "react"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"

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
