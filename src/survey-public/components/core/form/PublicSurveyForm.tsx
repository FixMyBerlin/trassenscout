import { zodResolver } from "@hookform/resolvers/zod"
import { clsx } from "clsx"
import { PropsWithoutRef, ReactNode, useEffect } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import { z } from "zod"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  children: ReactNode
  schema?: S
  onSubmit: (values: z.infer<S>, submitterId?: string) => void
  onChangeValues?: (values: any) => void
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
}

export const FORM_ERROR = "FORM_ERROR"

export function PublicSurveyForm<S extends z.ZodType<any, any>>({
  children,
  schema,
  initialValues,
  onSubmit,
  onChangeValues,
  className,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
    reValidateMode: "onChange",
    criteriaMode: "all",
  })
  useEffect(() => {
    if (onChangeValues) {
      onChangeValues(ctx.getValues())
    }
  }, [onChangeValues, ctx])

  // TODO REACTCOMPILER find a propper fix
  // eslint-disable-next-line react-compiler/react-compiler
  if (onChangeValues) props.onChange = () => onChangeValues(ctx.getValues())

  return (
    <FormProvider {...ctx}>
      <form
        className={clsx("space-y-6", className)}
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          // @ts-ignore
          const submitterId = e.nativeEvent.submitter.id
          await ctx.handleSubmit(async (values) => await onSubmit(values, submitterId))()
          e.preventDefault()
        }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  )
}

export default PublicSurveyForm
