import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { zodResolver } from "@hookform/resolvers/zod"
import { clsx } from "clsx"
import { PropsWithoutRef, ReactNode, useState } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import { IntlProvider } from "react-intl"
import { z } from "zod"
import { FormError } from "./FormError"
import { errorMessageTranslations } from "./errorMessageTranslations"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  /** All your form fields */
  children?: ReactNode
  /** Text to display in the submit button */
  submitText: string
  submitClassName?: string
  resetOnSubmit?: boolean
  schema?: S
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  disabled?: boolean
  /** Action bar content to display next to submit button (on the left) */
  actionBarLeft?: ReactNode
  /** Action bar content to display on the right side of the action bar */
  actionBarRight?: ReactNode
}

interface OnSubmitResult {
  FORM_ERROR?: string
  [prop: string]: any
}

export const FORM_ERROR = "FORM_ERROR"

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  submitClassName,
  resetOnSubmit,
  schema,
  initialValues,
  onSubmit,
  className,
  disabled,
  actionBarLeft,
  actionBarRight,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
    disabled,
  })
  const [formError, setFormError] = useState<string | null>(null)
  return (
    <IntlProvider messages={errorMessageTranslations} locale="de" defaultLocale="de">
      <FormProvider {...ctx}>
        <form
          className={clsx("space-y-6", className)}
          onSubmit={ctx.handleSubmit(async (values) => {
            const result = (await onSubmit(values)) || {}
            for (const [key, value] of Object.entries(result)) {
              if (key === FORM_ERROR) {
                // For ZodErrors, the message field is not deserialized.
                // We try to parse it here but also make catch edge cases.
                // Learn more at https://github.com/blitz-js/blitz/issues/4059
                if (value.name === "ZodError" && typeof value.message === "string") {
                  try {
                    value.message = JSON.parse(value.message)
                  } catch {}
                }
                setFormError(value)
              } else {
                ctx.setError(key as any, {
                  type: "submit",
                  message: value,
                })
              }
            }
            // Reset form state if resetOnSubmit is true and no FORM_ERROR is present
            // introduced for ProjectRecordform
            if (resetOnSubmit && !result.FORM_ERROR) {
              ctx.reset()
              setFormError(null)
            }
          })}
          {...props}
        >
          {/* Form fields supplied as children are rendered here */}
          {children}

          <FormError formError={formError} />

          <div className="flex items-center justify-between gap-4 rounded-md bg-gray-100 p-4">
            <div className="flex items-center gap-4">
              <SubmitButton className={submitClassName}>{submitText}</SubmitButton>
              {actionBarLeft}
            </div>
            {actionBarRight && (
              <div className="flex items-center gap-4">
                {actionBarRight}
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    </IntlProvider>
  )
}

export default Form
