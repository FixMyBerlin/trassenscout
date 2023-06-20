import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledRadiobuttonProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Radiobutton scope */
  scope: string
  /** Field value */
  value: string
  /** Optional field `name` and `id`; Default is `value` */
  name?: string
  /** Field label */
  label: string | React.ReactNode
  /** Optional help text below field label */
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
}

// Note: See also src/participation/components/form/ParticipationLabeledRadiobutton.tsx
export const LabeledRadiobutton = forwardRef<HTMLInputElement, LabeledRadiobuttonProps>(
  ({ scope, value, name, label, help, outerProps, labelProps, ...props }, _ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name || value])

    return (
      <div
        {...outerProps}
        className={clsx(outerProps?.className, "flex break-inside-avoid items-start")}
      >
        <div className="flex h-5 items-center">
          <input
            type="radio"
            disabled={isSubmitting}
            value={value}
            {...register(scope)}
            id={name || value}
            {...props}
            className={clsx(
              "h-4 w-4",
              hasError
                ? "border-red-800 text-red-500 shadow-sm shadow-red-200 focus:ring-red-800"
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
              <p role="alert" className="m-0 text-sm text-red-800">
                {message}
              </p>
            )}
            errors={errors}
            name={name || value}
          />
        </label>
      </div>
    )
  }
)
