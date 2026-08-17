import { ChevronRightIcon } from "@heroicons/react/20/solid"
import type { ReactNode } from "react"
import {
  formDetailsChevronClassName,
  formDetailsSummaryClassName,
} from "@/src/components/core/components/forms/styles/formDetailsStyles"

export function FormDetailsSummary({ children }: { children: ReactNode }) {
  return (
    <summary className={formDetailsSummaryClassName}>
      {children}
      <ChevronRightIcon className={formDetailsChevronClassName} aria-hidden="true" />
    </summary>
  )
}
