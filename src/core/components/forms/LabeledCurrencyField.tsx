import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef, useRef } from "react"
import clsx from "clsx"
import { useFormContext } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"
import { NumberFormatBase } from "react-number-format"

export interface LabeledCurrencyFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  readOnly?: boolean
}

const removeFormatting = (s: string) => {
  if (s === "") return ""

  const parts = s.split(",")
  if (parts.length > 1) {
    s = [parts[0], parts.slice(1).join("")].join(",")
  }
  s = s
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
  return s
}

const format = (s: string) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(s))
}

export const LabeledCurrencyField = forwardRef<HTMLInputElement, LabeledCurrencyFieldProps>(
  ({ name, label, help, outerProps, labelProps, optional, readOnly }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
      setValue,
      getValues,
    } = useFormContext()

    const hasError = Boolean(errors[name])

    const value = getValues()[name]
    const formattedValue = useRef(format(value))

    const checkCommaAndRemoveFormatting = (s: string) => {
      if (s === formattedValue.current.replace(",", "")) {
        // comma was deleted
        s = formattedValue.current
      } else {
        formattedValue.current = s
      }
      return removeFormatting(s)
    }

    return (
      <div {...outerProps}>
        <label
          {...labelProps}
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
          {optional && <> (optional)</>}
        </label>

        <NumberFormatBase
          name={name}
          value={value}
          getInputRef={ref}
          disabled={isSubmitting}
          onChange={(e) => setValue(name, Number(removeFormatting(e.target.value)))}
          onBlur={register(name).onBlur}
          removeFormatting={checkCommaAndRemoveFormatting}
          format={format}
          className={clsx(
            readOnly &&
              "cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200 sm:text-sm sm:leading-6",
            "block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200",
            hasError
              ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          )}
        />

        {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}

        <ErrorMessage
          render={({ message }) => (
            <div role="alert" className="mt-1 text-sm text-red-800">
              {message}
            </div>
          )}
          errors={errors}
          name={name}
        />
      </div>
    )
  },
)
