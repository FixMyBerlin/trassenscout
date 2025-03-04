import { ErrorMessage } from "@hookform/error-message"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef, ReactNode } from "react"
import { useFormContext } from "react-hook-form"

export interface TSurveyLabeledCheckbox extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string | ReactNode
  /** Help text below field label. */
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
}

export const SurveyLabeledCheckbox = forwardRef<HTMLInputElement, TSurveyLabeledCheckbox>(
  function SurveyLabeledCheckbox({ name, label, help, outerProps, labelProps, ...props }, ref) {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

    return (
      <div {...outerProps} className={clsx(outerProps?.className, "group flex items-start")}>
        <div className="flex h-full min-h-[2.5rem] items-center">
          <input
            type="checkbox"
            disabled={isSubmitting}
            {...register(name)}
            id={name}
            {...props}
            className={clsx(
              props?.className,
              "h-4 w-4 cursor-pointer rounded group-hover:border-gray-400",
              hasError
                ? "border-red-500 text-red-500 shadow-sm shadow-red-200 focus:ring-red-500"
                : `border-gray-300 text-[var(--survey-primary-color)] focus:ring-0`,
            )}
          />
        </div>
        <label
          htmlFor={name}
          {...labelProps}
          className={clsx(
            labelProps?.className,
            "-ml-6 flex h-full min-h-[2.5rem] w-full cursor-pointer flex-col items-start justify-center pl-9 text-sm font-medium text-gray-700 hover:text-gray-800 sm:w-auto sm:pr-24",
          )}
        >
          <span>{label}</span>
          {help && <div className="m-0 text-gray-400">{help}</div>}
          <ErrorMessage
            render={({ message }) => (
              <p role="alert" className="m-0 text-sm text-red-500">
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
