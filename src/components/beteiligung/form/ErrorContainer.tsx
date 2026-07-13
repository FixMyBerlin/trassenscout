import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"

type ErrorContainerProps = {
  children: ReactNode
  hasError: boolean
  className?: string
}

export const FieldWithErrorContainer = ({ children, hasError, className }: ErrorContainerProps) => {
  return (
    <div
      className={twJoin(
        "mt-8 mb-4 w-full p-2 py-3",
        hasError ? "rounded-lg bg-red-50" : "",
        className,
      )}
    >
      {children}
    </div>
  )
}
