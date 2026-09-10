import { useSyncExternalStore } from "react"
import { isProduction } from "@/src/components/core/utils/isEnv"

const adminDebugButtonsStorageKey = "trassenscout.adminDebugButtonsEnabled"
const adminDebugButtonsChangeEvent = "trassenscout:admin-debug-buttons-change"
export const adminDebugButtonsAvailable = !isProduction

const isBrowser = () => typeof window !== "undefined"

const getAdminDebugButtonsEnabled = () => {
  if (!adminDebugButtonsAvailable) return false
  if (!isBrowser()) return false

  try {
    return window.localStorage.getItem(adminDebugButtonsStorageKey) === "true"
  } catch {
    return false
  }
}

const subscribeToAdminDebugButtons = (onStoreChange: () => void) => {
  if (!isBrowser()) return () => {}

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === adminDebugButtonsStorageKey) {
      onStoreChange()
    }
  }

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener(adminDebugButtonsChangeEvent, onStoreChange)

  return function unsubscribeFromAdminDebugButtons() {
    window.removeEventListener("storage", handleStorageChange)
    window.removeEventListener(adminDebugButtonsChangeEvent, onStoreChange)
  }
}

export function useAdminDebugButtonsEnabled() {
  return useSyncExternalStore(
    subscribeToAdminDebugButtons,
    getAdminDebugButtonsEnabled,
    () => false,
  )
}

export function setAdminDebugButtonsEnabled(enabled: boolean) {
  if (!adminDebugButtonsAvailable) return
  if (!isBrowser()) return

  try {
    if (enabled) {
      window.localStorage.setItem(adminDebugButtonsStorageKey, "true")
    } else {
      window.localStorage.removeItem(adminDebugButtonsStorageKey)
    }
  } catch {
  }

  window.dispatchEvent(new Event(adminDebugButtonsChangeEvent))
}
