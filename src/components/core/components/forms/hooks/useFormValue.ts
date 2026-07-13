import { useStore } from "@tanstack/react-form"
import { useFormShellState } from "./useFormShellState"

/** Subscribe to one value in `form.state.values` (cross-field reads, previews, maps). */
export function useFormValue<TValue = unknown>(name: string) {
  const { form } = useFormShellState()
  return useStore(form.store, (state) => state.values[name] as TValue)
}
