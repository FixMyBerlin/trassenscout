"use client"

import { useFormDirty } from "@/src/core/components/forms/hooks/useFormDirty"
import { useEffect } from "react"

export const FormDirtyStateReporter = ({
  onDirtyChange,
}: {
  onDirtyChange?: (isDirty: boolean) => void
}) => {
  const isDirty = useFormDirty()

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  return null
}
