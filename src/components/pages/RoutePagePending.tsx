import { Spinner } from "@/src/components/core/components/Spinner"

/** Default route pending UI – replaces the old Next.js root `loading.tsx`. */
export function RoutePagePending() {
  return <Spinner page />
}
