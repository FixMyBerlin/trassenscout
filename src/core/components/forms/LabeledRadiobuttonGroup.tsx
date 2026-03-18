import { formatFormError } from "@/src/core/components/forms/formatFormError"
import type { FormApi } from "@/src/core/components/forms/types"
import { clsx } from "clsx"
import { LabeledRadiobutton, LabeledRadiobuttonProps } from "./LabeledRadiobutton"

export type LabeledRadiobuttonGroupProps = {
  form: FormApi<Record<string, unknown>>
  label?: string
  optional?: boolean
  disabled?: boolean
  scope: string
  items: Omit<LabeledRadiobuttonProps, "scope" | "form">[]
  classLabelOverwrite?: string
  classNameItemWrapper?: string
  onChange?: (value: string) => void
  help?: string | React.ReactNode
}

export const LabeledRadiobuttonGroup = ({
  form,
  label,
  optional,
  disabled,
  scope,
  items,
  classLabelOverwrite,
  classNameItemWrapper,
  onChange,
  help,
}: LabeledRadiobuttonGroupProps) => {
  const itemsWithScope = items.map((i) => ({
    ...i,
    form,
    scope,
    _onChange: onChange,
    showScopeErrors: false,
  }))

  return (
    <div>
      {label && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={clsx(classNameItemWrapper || "space-y-3")}>
        {itemsWithScope.map((item) => {
          return <LabeledRadiobutton key={item.value} {...item} disabled={disabled} />
        })}
      </div>
      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
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
