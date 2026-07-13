import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"

type Props = {
  children: ReactNode
  className?: string
}

export const SurveyMapPanelContainer = ({ children, className }: Props) => {
  return (
    <div
      className={twJoin(
        "absolute inset-x-0 bottom-10 mx-12 rounded-xs bg-white/80 p-4 px-8 text-center text-base",
        className,
      )}
    >
      {children}
    </div>
  )
}
