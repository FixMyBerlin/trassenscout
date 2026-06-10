import { useEffect } from "react"
import { useFormDirty } from "@/src/components/core/components/forms/hooks/useFormDirty"

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
