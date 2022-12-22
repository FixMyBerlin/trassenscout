import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
}

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({ label, outerProps, labelProps, name, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

    return (
      <div {...outerProps}>
        <label {...labelProps} className="block text-sm font-medium text-gray-700">
          {label}
          <input
            disabled={isSubmitting}
            {...register(name)}
            {...props}
            className={clsx(
              "block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm",
              hasError
                ? "border-red-700 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            )}
          />
        </label>

        <ErrorMessage
          render={({ message }) => (
            <div role="alert" className="text-red-700 text-sm">
              {message}
            </div>
          )}
          errors={errors}
          name={name}
        />
      </div>
    )
  }
)

export default LabeledTextField
