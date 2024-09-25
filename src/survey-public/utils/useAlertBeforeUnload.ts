import { useEffect } from "react"
import { useFormState } from "react-hook-form"

export const useAlertBeforeUnload = () => {
  const { isDirty } = useFormState()

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) return e.preventDefault()
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [isDirty])
}
