import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface ParticipationLabeledRadiobuttonProps
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
}

export const ParticipationLabeledRadiobutton = forwardRef<
  HTMLInputElement,
  ParticipationLabeledRadiobuttonProps
>(({ scope, name, label, value, help, outerProps, labelProps, ...props }, ref) => {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext()

  const hasError = Boolean(errors[name])

  return (
    <div {...outerProps} className={clsx(outerProps?.className, "flex h-10 w-full items-start")}>
      <div className="flex h-full items-center">
        <input
          type="radio"
          disabled={isSubmitting}
          value={value}
          {...register(scope)}
          id={name}
          {...props}
          className={clsx(
            "h-4 w-4 cursor-pointer",
            hasError
              ? "border-red-800 text-red-500 shadow-sm shadow-red-200 focus:ring-red-800"
              : "border-gray-300 text-pink-500 focus:ring-0"
          )}
        />
      </div>
      <label
        {...labelProps}
        htmlFor={name}
        className="-ml-6 flex h-full w-full cursor-pointer items-center pl-9 text-sm font-medium text-gray-700 hover:text-gray-800 sm:w-auto sm:pr-24"
      >
        {label}
        {help && <div className="m-0 text-gray-500">{help}</div>}
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
})
