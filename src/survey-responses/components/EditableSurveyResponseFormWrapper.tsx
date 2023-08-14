import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { PropsWithoutRef, ReactNode, useEffect } from "react"
import { FormProvider, useForm, UseFormProps } from "react-hook-form"
import { z } from "zod"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  children: ReactNode
  schema?: S
  onSubmit: (values: z.infer<S>) => void
  onChange: (values: any) => void
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
}

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseFormWrapper<S extends z.ZodType<any, any>>({
  children,
  schema,
  initialValues,
  onSubmit,
  onChange,
  className,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  return (
    <FormProvider {...ctx}>
      <form
        className={className}
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          await ctx.handleSubmit(async (values) => await onSubmit(values))()
          e.preventDefault()
        }}
        onChange={async (e: React.FormEvent<HTMLFormElement>) => {
          await ctx.handleSubmit(async (values) => await onChange(values))()
          e.preventDefault()
        }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  )
}

export default EditableSurveyResponseFormWrapper
