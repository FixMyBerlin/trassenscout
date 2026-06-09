"use client"

import { useAppFormContext } from "@/src/core/components/forms/hooks/formContext"
import { blueButtonStyles } from "@/src/core/components/links"
import clsx from "clsx"

type SubmitButtonProps = {
  label: string
  className?: string
  disabled?: boolean
}

export function SubmitButton({ label, className, disabled }: SubmitButtonProps) {
  const form = useAppFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button
          type="submit"
          disabled={isSubmitting || disabled}
          className={clsx(className || blueButtonStyles)}
        >
          {label}
        </button>
      )}
    </form.Subscribe>
  )
}
