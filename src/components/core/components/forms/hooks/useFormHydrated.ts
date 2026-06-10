import { createContext, useContext } from "react"

const FormHydratedContext = createContext(false)

export const FormHydratedProvider = FormHydratedContext.Provider

function useFormHydrated() {
  return useContext(FormHydratedContext)
}

/** Combine hydration gate with an optional per-field disabled flag. */
export function useFieldDisabled(disabled?: boolean) {
  const isHydrated = useFormHydrated()
  return !isHydrated || Boolean(disabled)
}
