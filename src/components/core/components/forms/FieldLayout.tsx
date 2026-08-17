import type { ValidationError } from "@tanstack/react-form"
import type { JSX } from "react"
import { ComponentPropsWithoutRef, PropsWithoutRef, ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import {
  fieldLayoutControlClassName,
  fieldLayoutLabelClassName,
  fieldLayoutRootClassName,
  fieldLayoutStackedOverrideClassName,
} from "@/src/components/core/components/forms/fieldLayoutStyles"

export type FieldLayoutProps = {
  label: ReactNode
  optional?: boolean
  htmlFor?: string
  help?: ReactNode
  errors?: ValidationError[]
  labelProps?: ComponentPropsWithoutRef<"label">
  classLabelOverwrite?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  children: ReactNode
}

export function FieldLayout({
  label,
  optional,
  htmlFor,
  help,
  errors,
  labelProps,
  classLabelOverwrite,
  outerProps,
  children,
}: FieldLayoutProps) {
  const { className: labelClassName, ...restLabelProps } = labelProps ?? {}

  return (
    <div {...outerProps} className={twMerge(fieldLayoutRootClassName, outerProps?.className)}>
      <label
        {...restLabelProps}
        htmlFor={htmlFor}
        className={twMerge(fieldLayoutLabelClassName, classLabelOverwrite, labelClassName)}
      >
        {label}
        {optional && <> (optional)</>}
      </label>
      <div className={fieldLayoutControlClassName}>
        {children}
        {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
        {errors && errors.length > 0 && <FieldErrors errors={errors} />}
      </div>
    </div>
  )
}

/** Full-width block that lines up with the control column (e.g. collapsible extras). */
export function FieldLayoutRightColumn({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={fieldLayoutRootClassName}>
      <div
        className={twJoin(
          fieldLayoutControlClassName,
          fieldLayoutStackedOverrideClassName,
          "sm:col-start-2",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
