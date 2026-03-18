import type { FormApi } from "@/src/core/components/forms/types"
import { formatFormError } from "@/src/core/components/forms/formatFormError"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"

export interface LabeledSelectProps extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements["select"]>,
  "onChange"
> {
  form: FormApi<Record<string, unknown>>
  name: string
  options: [string | number | "", string][]
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  classLabelOverwrite?: string
  onChange?: (value: string) => void
}

export const LabeledSelect = forwardRef<HTMLSelectElement, LabeledSelectProps>(
  function LabeledSelect(
    {
      form,
      name,
      options,
      label,
      help,
      outerProps,
      labelProps,
      optional,
      classLabelOverwrite,
      onChange,
      ...props
    },
    _ref,
  ) {
    return (
      <form.Field name={name}>
        {(field) => {
          const hasError = field.state.meta.errors.length > 0
          const raw = field.state.value
          const selectVal =
            raw === "" || raw === null || raw === undefined
              ? ""
              : typeof raw === "number"
                ? String(raw)
                : String(raw)
          return (
            <div {...outerProps}>
              <label
                {...labelProps}
                htmlFor={name}
                className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
              >
                {label}
                {optional && <> (optional)</>}
              </label>
              <select
                disabled={field.form.state.isSubmitting}
                id={name}
                {...props}
                value={selectVal}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const v = e.target.value
                  const opt = options.find(([val]) => String(val) === v)
                  const parsed =
                    opt?.[0] === ""
                      ? null
                      : typeof opt?.[0] === "number"
                        ? Number(v)
                        : v === ""
                          ? null
                          : v
                  field.handleChange(parsed as never)
                  onChange?.(v)
                }}
                className={clsx(
                  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 shadow-xs focus:outline-hidden sm:text-sm",
                  hasError
                    ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                )}
              >
                {options.map(([value, text]) => (
                  <option key={String(value)} value={value === "" ? "" : String(value)}>
                    {text}
                  </option>
                ))}
              </select>
              {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
              {hasError && (
                <div role="alert" className="mt-1 text-sm text-red-800">
                  {field.state.meta.errors.map((err) => formatFormError(err)).join(", ")}
                </div>
              )}
            </div>
          )
        }}
      </form.Field>
    )
  },
)
