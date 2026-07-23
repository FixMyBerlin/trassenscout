import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  children: ReactNode
  className?: string
}

/** Footer chrome for padded back links below forms and list pages. */
export function BackLinkSection({ children, className }: Props) {
  return <div className={twMerge("border-b border-gray-200 p-4", className)}>{children}</div>
}
