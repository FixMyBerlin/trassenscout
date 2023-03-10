import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledCheckboxProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Help text below field label. */
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
}

export const LabeledCheckbox = forwardRef<HTMLInputElement, LabeledCheckboxProps>(
  ({ name, label, help, outerProps, labelProps, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

    return (
      <div {...outerProps} className={clsx(outerProps?.className, "flex items-start")}>
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            disabled={isSubmitting}
            {...register(name)}
            id={name}
            {...props}
            className={clsx(
              "h-4 w-4 rounded",
              hasError
                ? "border-pink-800 text-pink-500 shadow-sm shadow-pink-200 focus:ring-pink-800"
                : "border-gray-300 text-blue-600 focus:ring-blue-500"
            )}
          />
        </div>
        <label
          {...labelProps}
          htmlFor={name}
          className="ml-3 block cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          {label}
          {help && <div className="m-0 text-gray-500">{help}</div>}
          <ErrorMessage
            render={({ message }) => (
              <p role="alert" className="m-0 text-sm text-pink-800">
                {message}
              </p>
            )}
            errors={errors}
            name={name}
          />
        </label>
      </div>
    )
  }
)
