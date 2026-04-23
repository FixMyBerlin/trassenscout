"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

const hasDirtyFields = (value: unknown): boolean => {
  if (typeof value === "boolean") return value
  if (Array.isArray(value)) return value.some((item) => hasDirtyFields(item))
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => hasDirtyFields(item))
  }
  return false
}

export const FormDirtyStateReporter = ({
  onDirtyChange,
}: {
  onDirtyChange?: (isDirty: boolean) => void
}) => {
  const {
    formState: { dirtyFields },
  } = useFormContext()
  const hasUserChanges = hasDirtyFields(dirtyFields)

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(hasUserChanges)
  }, [hasUserChanges, onDirtyChange])

  return null
}
