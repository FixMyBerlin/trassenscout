import { clsx } from "clsx"
import { ReactNode } from "react"

type ErrorContainerProps = {
  children: ReactNode
  hasError: boolean
  className?: string
}

export const FieldWithErrorContainer = ({ children, hasError, className }: ErrorContainerProps) => {
  return (
    <div
      className={clsx("mt-8 mb-4 w-full p-2 py-3", hasError && "rounded-lg bg-red-50", className)}
    >
      {children}
    </div>
  )
}
