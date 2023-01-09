import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledTextareaProps extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
}

export const LabeledTextareaField = forwardRef<HTMLTextAreaElement, LabeledTextareaProps>(
  ({ name, label, outerProps, labelProps, optional, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

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
            "mt-1 block w-full rounded-md shadow-sm sm:text-sm",
            hasError
              ? "border-red-700 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />

        <ErrorMessage
          render={({ message }) => (
            <div role="alert" className="mt-1 text-sm text-red-700">
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
