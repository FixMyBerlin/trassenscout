import { useStore } from "@tanstack/react-form"
import { useFormContext } from "./formContext"

/** Base hook for any descendant of `<Form>`: shared form instance + submit state. */
export function useFormShellState() {
  const form = useFormContext()
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  return { form, isSubmitting }
}
