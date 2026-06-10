import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** True after client hydration; false during SSR. */
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
