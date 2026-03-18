import { formatFormError } from "@/src/core/components/forms/formatFormError"
import type { FormApi } from "@/src/core/components/forms/types"
import { clsx } from "clsx"
import { LabeledCheckbox, LabeledCheckboxProps } from "./LabeledCheckbox"

type Props = {
  form: FormApi<Record<string, unknown>>
  label?: string
  optional?: boolean
  disabled?: boolean
  scope: string
  items: Omit<LabeledCheckboxProps, "scope" | "form">[]
  classLabelOverwrite?: string
  classNameItemWrapper?: string
}

export const LabeledCheckboxGroup = ({
  form,
  label,
  optional,
  disabled,
  scope,
  items,
  classLabelOverwrite,
  classNameItemWrapper,
}: Props) => {
  return (
    <div>
      {label && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={clsx(classNameItemWrapper, "flex flex-col gap-3")}>
        {items.map((item) => (
          <LabeledCheckbox
            key={item.value}
            form={form}
            scope={scope}
            {...item}
            disabled={disabled}
            showScopeErrors={false}
          />
        ))}
      </div>
      <form.Field name={scope}>
        {(field) =>
          field.state.meta.errors.length > 0 ? (
            <p role="alert" className="mt-2 text-sm text-red-800">
              {field.state.meta.errors.map((err) => formatFormError(err)).join(", ")}
            </p>
          ) : null
        }
      </form.Field>
    </div>
  )
}
