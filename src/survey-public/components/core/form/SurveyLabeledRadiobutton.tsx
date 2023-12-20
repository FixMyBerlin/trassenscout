import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface SurveyLabeledRadiobuttonProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Radiobutton scope. */
  scope: string
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field value. */
  value: string
  /** Help text below field label. */
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  primaryColor: "red" | "pink"
}

export const SurveyLabeledRadiobutton = forwardRef<HTMLInputElement, SurveyLabeledRadiobuttonProps>(
  ({ scope, name, label, value, help, outerProps, labelProps, primaryColor, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

    let colorClass: string
    switch (primaryColor) {
      case "pink":
        colorClass = "text-pink-500"
        break
      case "red":
        colorClass = "text-crimson-500"
        break
      default:
        colorClass = "text-pink-500"
    }

    return (
      <div {...outerProps} className={clsx(outerProps?.className, "group flex w-full items-start")}>
        <div className="flex h-full min-h-[2.5rem] items-center py-2">
          <input
            type="radio"
            disabled={isSubmitting}
            value={value}
            {...register(scope)}
            id={name}
            {...props}
            className={clsx(
              "h-4 w-4 cursor-pointer group-hover:border-gray-400",
              hasError
                ? "border-red-800 text-red-500 shadow-sm shadow-red-200 focus:ring-red-800"
                : `border-gray-300 focus:ring-0 ${colorClass}`,
            )}
          />
        </div>
        <label
          {...labelProps}
          htmlFor={name}
          className="-ml-6 flex h-full min-h-[2.5rem] w-full cursor-pointer flex-col items-start justify-center py-2 pl-9 text-sm font-medium text-gray-700 hover:text-gray-800 sm:w-auto sm:pr-24"
        >
          <span>{label}</span>
          {help && <div className="m-0 text-gray-400">{help}</div>}
          <ErrorMessage
            render={({ message }) => (
              <p role="alert" className="m-0 text-sm text-red-800">
                {message}
              </p>
            )}
            errors={errors}
            name={name}
          />
        </label>
      </div>
    )
  },
)
