import { ErrorMessage } from "@hookform/error-message"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  help?: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    // | "datetime-local" // This is broken in Firefox, so we cannot use it
    | "tel"
    | "url"
    | "date"
    | "time"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
}

export const SurveyLabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  function SurveyLabeledTextField(
    { name, label, help, outerProps, labelProps, optional, ...props },
    ref,
  ) {
    const {
      register,
      formState: { isSubmitting, errors },
      // getValues,
      // setValue,
    } = useFormContext()

    const hasError = Boolean(errors[name])

    // Field Type `datetime-local` requires a format of "YYYY-MM-DDTHH:MM:SS" to pre fill the value.
    // const value = getValues()[name]
    // if (value && props.type === "datetime-local") {
    //   setValue(name, new Date(value as string).toISOString().split(".")[0])
    // }

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
        <input
          disabled={isSubmitting}
          {...register(name)}
          id={name}
          {...props}
          className={clsx(
            "block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm",
            hasError
              ? "border-red-500 shadow-red-200 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[var(--survey-primary-color)] focus:ring-[var(--survey-primary-color)]",
          )}
        />
        {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}

        <ErrorMessage
          render={({ message }) => (
            <div role="alert" className="mt-1 text-sm text-red-500">
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
