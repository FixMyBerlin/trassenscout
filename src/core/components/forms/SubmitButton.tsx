"use client"

import { blueButtonStyles } from "@/src/core/components/links"
import clsx from "clsx"
import { useFormContext } from "react-hook-form"

interface SubmitButtonProps {
  children: string
  className?: string
}

export const SubmitButton = ({ children, className }: SubmitButtonProps) => {
  const { formState } = useFormContext()

  return (
    <button
      type="submit"
      disabled={formState.isSubmitting || formState.disabled}
      className={clsx("mt-6", className || blueButtonStyles)}
    >
      {children}
    </button>
  )
}
