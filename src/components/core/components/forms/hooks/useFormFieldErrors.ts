import { useStore } from "@tanstack/react-form"
import { useFormShellState } from "./useFormShellState"

/** Validation errors for a field from `fieldMeta` (no `form.Field` wrapper). */
export function useFormFieldErrors(name: string) {
  const { form } = useFormShellState()
  return useStore(form.store, (state) => state.fieldMeta[name]?.errors ?? [])
}
