import { ActionBar } from "@/src/core/components/forms/ActionBar"
import { formatFormError } from "@/src/core/components/forms/formatFormError"
import type { FormApi, SubmitResult } from "@/src/core/components/forms/types"
import { blueButtonStyles } from "@/src/core/components/links"
import type { FormValidateOrFn } from "@tanstack/form-core"
import { useForm } from "@tanstack/react-form"
import { clsx } from "clsx"
import { ReactNode, useEffect, useState } from "react"
import { z } from "zod"

export type { SubmitResult } from "@/src/core/components/forms/types"

export type FormProps<S extends z.ZodType<any, any>> = {
  children: (form: FormApi<Record<string, unknown>>) => ReactNode
  submitText: string
  submitClassName?: string
  resetOnSubmit?: boolean
  schema: S
  onSubmit: (values: z.infer<S>) => Promise<void | SubmitResult<z.infer<S>>>
  initialValues?: Partial<z.infer<S>>
  disabled?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  onValuesChange?: (values: z.infer<S>) => void
  /** When false, only custom submit controls (e.g. in children) submit the form. */
  showDefaultSubmit?: boolean
}

function applyFieldErrors(
  form: { setFieldMeta: unknown; state: { values: unknown } },
  errors: Partial<Record<string, string[]>> | undefined,
) {
  if (!errors) return
  const values = form.state.values
  if (typeof values !== "object" || values === null) return
  const setFieldMeta = form.setFieldMeta as (
    field: string,
    updater: (prev: { errors?: string[] }) => { errors: string[] },
  ) => void
  for (const key of Object.keys(errors)) {
    if (!(key in values)) continue
    const messages = errors[key]
    if (!messages?.length) continue
    setFieldMeta(key, (prev) => ({
      ...prev,
      errors: [...(prev?.errors ?? []), ...messages],
    }))
  }
}

function FormValuesSync<S extends z.ZodType<any, any>>({
  form,
  onValuesChange,
}: {
  form: { store: { subscribe: (fn: () => void) => () => void }; state: { values: z.infer<S> } }
  onValuesChange: (values: z.infer<S>) => void
}) {
  useEffect(() => {
    return form.store.subscribe(() => {
      onValuesChange(form.state.values)
    })
  }, [form, onValuesChange])
  return null
}

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
  onValuesChange,
  showDefaultSubmit = true,
}: FormProps<S>) {
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  type V = z.infer<S>
  const defaults = (initialValues ?? {}) as V

  const form = useForm({
    defaultValues: defaults,
    validators: {
      onBlur: schema as FormValidateOrFn<V>,
      onSubmit: schema as FormValidateOrFn<V>,
    },
    onSubmit: async ({ value }) => {
      setSubmitMessage(null)
      const result = await onSubmit(value)
      if (!result) {
        if (resetOnSubmit) {
          form.reset()
          setSubmitMessage(null)
        }
        return
      }
      if (result.success) {
        setSubmitMessage({ type: "success", text: result.message ?? "Gespeichert." })
        if (resetOnSubmit) {
          form.reset()
        }
        return
      }
      setSubmitMessage({ type: "error", text: result.message })
      applyFieldErrors(form, result.errors)
    },
  })

  return (
    <form
      className={clsx("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      {onValuesChange ? (
        <FormValuesSync form={form as never} onValuesChange={onValuesChange} />
      ) : null}
      {children(form as FormApi<Record<string, unknown>>)}

      <form.Subscribe selector={(s) => s.errors}>
        {(errors) =>
          errors.length > 0 && (
            <div role="alert" className="rounded-sm bg-red-50 px-2 py-1 text-sm text-red-800">
              {errors.map((err) => (
                <p key={formatFormError(err)}>{formatFormError(err)}</p>
              ))}
            </div>
          )
        }
      </form.Subscribe>

      {submitMessage && (
        <div
          className={clsx(
            "rounded-sm px-2 py-1 text-sm",
            submitMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800",
          )}
          role={submitMessage.type === "error" ? "alert" : "status"}
        >
          {submitMessage.text}
        </div>
      )}

      {(showDefaultSubmit || actionBarLeft != null || actionBarRight != null) && (
        <ActionBar
          left={
            <>
              {showDefaultSubmit ? (
                <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <button
                      type="submit"
                      disabled={disabled || !canSubmit || isSubmitting}
                      className={submitClassName || blueButtonStyles}
                    >
                      {isSubmitting ? "…" : submitText}
                    </button>
                  )}
                </form.Subscribe>
              ) : null}
              {actionBarLeft}
            </>
          }
          right={actionBarRight}
        />
      )}
    </form>
  )
}

export default Form
