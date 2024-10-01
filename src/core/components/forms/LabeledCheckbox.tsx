import { ErrorMessage } from "@hookform/error-message"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledCheckboxProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Checkbox scope. */
  scope: string
  /* The field value must be a string. If the value is a number in the DB,
   * it needs to be parsed to a string to be used as `initialValues`.
   * When passed to the mutation, the value needs to be parsed back to a number using `parseInt`.
   * This requires corresponding modifications to the ZOD schemas. */
  value: string
  /** Field label */
  label: string | React.ReactNode
  /** Optional help text below field label */
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  readonly?: boolean
  disabled?: boolean
}

export const LabeledCheckbox = forwardRef<HTMLInputElement, LabeledCheckboxProps>(
  ({ scope, value, label, help, outerProps, labelProps, readonly, disabled, ...props }, _ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[value])
    const key = [scope, value].join("-")

    return (
      <div
        {...outerProps}
        className={clsx(outerProps?.className, "flex break-inside-avoid items-start")}
      >
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            disabled={disabled || isSubmitting}
            readOnly={readonly}
            value={value}
            {...register(scope)}
            id={key}
            {...props}
            className={clsx(
              "h-4 w-4 rounded",
              hasError
                ? "border-red-800 text-red-500 shadow-sm shadow-red-200 focus:ring-red-800"
                : readonly || disabled
                  ? "border-gray-200 bg-gray-100 checked:bg-gray-500"
                  : "border-gray-300 text-blue-600 focus:ring-blue-500",
            )}
          />
        </div>
        <label
          {...labelProps}
          htmlFor={key}
          className={clsx(
            "ml-3 block whitespace-nowrap text-sm font-medium",
            readonly || disabled
              ? "text-gray-400"
              : "cursor-pointer text-gray-700 hover:text-gray-900",
          )}
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
            name={value}
          />
        </label>
      </div>
    )
  },
)
