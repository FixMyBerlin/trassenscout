import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface SurveyLabeledTextareaProps
  extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  primaryColor: "red" | "pink"
}

export const SurveyLabeledTextareaField = forwardRef<
  HTMLTextAreaElement,
  SurveyLabeledTextareaProps
>(
  (
    {
      name,
      label,
      help,
      outerProps,
      labelProps,
      optional,
      className: textareaClasName,
      primaryColor,
      ...props
    },
    ref,
  ) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

    let colorClass: string
    switch (primaryColor) {
      case "pink":
        colorClass = "focus:border-pink-500 focus:ring-pink-500"
        break
      case "red":
        colorClass = "focus:border-crimson-500 focus:ring-crimson-500"
        break
      default:
        colorClass = "focus:border-pink-500 focus:ring-pink-500"
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
        <textarea
          disabled={isSubmitting}
          {...register(name)}
          id={name}
          {...props}
          className={clsx(
            textareaClasName,
            "mt-1 block h-52 w-full rounded-md shadow-sm sm:text-sm",
            hasError
              ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : `border-gray-300 ${colorClass}}`,
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
        <p className="mt-2 text-right text-sm text-gray-500">Max. 2000 Zeichen</p>
      </div>
    )
  },
)
