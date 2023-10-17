import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef, useState } from "react"
import { useFormContext } from "react-hook-form"
// @ts-ignore
import { formatDefaultLocale } from "d3-format"

interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  help?: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  unit?: string
}

export const LabeledTextFieldFormat = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({ name, label, help, outerProps, labelProps, optional, unit, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
      getValues,
      setValue,
    } = useFormContext()

    const values = getValues()

    const germanLocale = formatDefaultLocale({
      decimal: ",",
      thousands: ".",
      grouping: [3],
    })

    const numberFormat = germanLocale.format("$,.2f")

    const [num, setNum] = useState({
      value: values[name] === null ? "" : String(values[name]).replace(/\./g, ","),
      reFormattedValue: String(values[name]),
      formattedValue: values[name] === null ? "k.A." : String(numberFormat(values[name])),
    })

    const hasError = Boolean(errors[name])

    const cleanStr = (str: string) => {
      return str
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^0-9.]/g, "")
    }

    const formatNumber = (str: string) => {
      const cleanString = cleanStr(str)
      if (cleanString === "") return "k.A."
      return numberFormat(cleanString)
    }

    const reFormatNumber = (str: string) => {
      const cleanString = cleanStr(str)
      return cleanString
    }

    console.log(num)
    setValue(name, num.reFormattedValue)

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
        <small>
          Formatierter Wert: {unit && num.formattedValue !== "k.A." && unit + " "}
          {num.formattedValue}
        </small>
        <input
          disabled={isSubmitting}
          value={num.value}
          onChange={(evt) => {
            setNum({
              value: evt.target.value,
              formattedValue: formatNumber(evt.target.value),
              reFormattedValue: reFormatNumber(evt.target.value),
            })
          }}
          {...props}
          className={clsx(
            props.readOnly &&
              "cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200 sm:text-sm sm:leading-6",
            "block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200",
            hasError
              ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          )}
        />
        <input
          disabled={isSubmitting}
          {...register(name)}
          value={num.reFormattedValue}
          id={name}
          {...props}
          className="hidden"
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
