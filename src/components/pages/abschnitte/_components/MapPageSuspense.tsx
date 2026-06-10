import { Suspense, type ReactNode } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"

export function MapPageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner page />}>{children}</Suspense>
}
