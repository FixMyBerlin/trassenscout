import type { FormApi } from "@/src/core/components/forms/types"
import { forwardRef, PropsWithoutRef } from "react"

export interface HiddenFieldProps extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements["input"]>,
  "form"
> {
  form: FormApi<Record<string, unknown>>
  name: string
}

export const HiddenField = forwardRef<HTMLInputElement, HiddenFieldProps>(function HiddenField(
  { form, name, ...props },
  _ref,
) {
  return (
    <form.Field name={name}>
      {(field) => (
        <input
          readOnly
          type="hidden"
          id={name}
          name={name}
          value={field.state.value == null ? "" : String(field.state.value)}
          onChange={() => {}}
          {...props}
        />
      )}
    </form.Field>
  )
})
