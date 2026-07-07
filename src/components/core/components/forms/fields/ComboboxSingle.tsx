import { XMarkIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import { type ListboxOptionUi } from "@/src/components/core/components/forms/checkmarkListboxUi"
import {
  ComboboxSingleBase,
  type ComboboxSingleItem,
} from "@/src/components/core/components/forms/ComboboxSingleBase"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { linkStyles } from "@/src/components/core/components/links/styles"

export type ComboboxSingleProps = {
  label?: string
  help?: string
  optional?: boolean
  disabled?: boolean
  items: ComboboxSingleItem[]
  placeholder?: string
  classLabelOverwrite?: string
  optionUi?: ListboxOptionUi
}

export function ComboboxSingle({
  label,
  help,
  optional,
  disabled,
  items,
  placeholder,
  classLabelOverwrite,
  optionUi,
}: ComboboxSingleProps) {
  const field = useFieldContext<string | number | null>()
  const fieldDisabled = useFieldDisabled(disabled)
  const hasError = field.state.meta.errors.length > 0
  const hasValue =
    field.state.value !== null && field.state.value !== undefined && field.state.value !== ""
  const comboboxValue = hasValue ? String(field.state.value) : ""

  return (
    <div>
      <div className="flex items-center gap-1">
        {Boolean(label) && (
          <label
            htmlFor={field.name}
            className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
          >
            {label}
            {optional && <> (optional)</>}
          </label>
        )}
        {optional && hasValue && (
          <div className="flex grow items-center justify-end">
            <button
              type="button"
              className={twJoin(linkStyles, "flex cursor-pointer items-center gap-1 text-sm")}
              onClick={() => field.handleChange(null)}
            >
              <XMarkIcon className="size-4" />
              <span>Auswahl zurücksetzen</span>
            </button>
          </div>
        )}
      </div>

      {Boolean(help) && <p className="mb-2 text-sm text-gray-500">{help}</p>}

      <ComboboxSingleBase
        id={field.name}
        value={comboboxValue}
        onChange={(next) => field.handleChange(next === null || next === "" ? null : next)}
        onBlur={field.handleBlur}
        items={items}
        placeholder={placeholder}
        disabled={fieldDisabled}
        invalid={hasError}
        optionUi={optionUi}
      />

      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
