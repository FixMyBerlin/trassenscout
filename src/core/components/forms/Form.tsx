import { useState, ReactNode, PropsWithoutRef } from "react"
import { FormProvider, useForm, UseFormProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import clsx from "clsx"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  /** All your form fields */
  children?: ReactNode
  /** Text to display in the submit button */
  submitText?: string
  schema?: S
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
}

interface OnSubmitResult {
  FORM_ERROR?: string
  [prop: string]: any
}

export const FORM_ERROR = "FORM_ERROR"

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  className,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })
  const [formError, setFormError] = useState<string | null>(null)

  return (
    <FormProvider {...ctx}>
      <form
        className={clsx("space-y-6", className)}
        onSubmit={ctx.handleSubmit(async (values) => {
          const result = (await onSubmit(values)) || {}
          for (const [key, value] of Object.entries(result)) {
            if (key === FORM_ERROR) {
              setFormError(value)
            } else {
              ctx.setError(key as any, {
                type: "submit",
                message: value,
              })
            }
          }
        })}
        {...props}
      >
        {/* Form fields supplied as children are rendered here */}
        {children}

        {formError && (
          <div role="alert" className="rounded bg-red-50 py-1 px-2 text-red-700">
            {formError}
          </div>
        )}

        {submitText && (
          <button
            type="submit"
            disabled={ctx.formState.isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {submitText}
          </button>
        )}
      </form>
    </FormProvider>
  )
}

export default Form
