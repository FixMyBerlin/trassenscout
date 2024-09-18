import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { useRouter } from "next/router"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  help?: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  queryId: string
}

export const SurveyLabeledReadOnlyTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({ name, label, help, outerProps, labelProps, optional, queryId, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
      // getValues,
      setValue,
    } = useFormContext()
    const router = useRouter()

    // in Survey[surveyName].tsx we update the query parameter to include the [queryId]
    // here we get the [queryId] from the url, display it and save with setValues in the survey FormProvider
    // the queryId is configured in the question in survey.ts

    setValue(
      name,
      router.query[queryId] && typeof router.query[queryId] === "string"
        ? decodeURIComponent(router.query[queryId])
        : "invalid",
    )

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
        <input
          disabled={isSubmitting}
          {...register(name)}
          id={name}
          {...props}
          className={clsx(
            "block w-full appearance-none rounded-md border bg-gray-200 px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm",
            hasError
              ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : "border-gray-300 focus:border-[var(--survey-primary-color)] focus:ring-[var(--survey-primary-color)]",
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
      </div>
    )
  },
)
