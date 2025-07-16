import { clsx } from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const SurveyMapPanelContainer = ({ children, className }: Props) => {
  return (
    <div
      className={clsx(
        "absolute inset-x-0 bottom-10 mx-12 rounded-sm bg-white/80 p-4 px-8 text-center text-base",
        className,
      )}
    >
      {children}
    </div>
  )
}
