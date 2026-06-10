import { useStore } from "@tanstack/react-form"
import { useFormShellState } from "./useFormShellState"

/** Whether the user has changed any field since mount / last reset. */
export function useFormDirty() {
  const { form } = useFormShellState()
  return useStore(form.store, (state) => state.isDirty)
}
