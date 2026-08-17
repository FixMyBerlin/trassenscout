import type { JSX } from "react"
import { ComponentPropsWithoutRef, PropsWithoutRef, ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"

export type TextareaFieldProps = {
  label: string
  help?: string
  optional?: boolean
  disabled?: boolean
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  trailingControl?: ReactNode
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["textarea"]>, "value" | "onChange" | "onBlur">

export function TextareaField({
  label,
  help,
  optional,
  disabled,
  outerProps,
  labelProps,
  trailingControl,
  className: textareaClassName,
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string | null>()
  const fieldDisabled = useFieldDisabled(disabled)
  const hasError = field.state.meta.errors.length > 0

  const textarea = (
    <textarea
      disabled={fieldDisabled}
      id={field.name}
      {...props}
      value={String(field.state.value ?? "")}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      className={twJoin(
        textareaClassName,
        "block w-full rounded-md shadow-xs sm:text-sm",
        hasError
          ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
          : props.readOnly || disabled
            ? "border-gray-200 bg-gray-100"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      )}
    />
  )

  return (
    <FieldLayout
      label={label}
      optional={optional}
      htmlFor={field.name}
      help={help}
      errors={field.state.meta.errors}
      labelProps={labelProps}
      outerProps={outerProps}
    >
      {trailingControl ? (
        <div className="flex flex-col items-start gap-2">
          {textarea}
          {trailingControl}
        </div>
      ) : (
        textarea
      )}
    </FieldLayout>
  )
}
