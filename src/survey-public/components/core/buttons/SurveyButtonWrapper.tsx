import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const SurveyButtonWrapper = ({ children }: Props) => {
  return (
    <div className="flex flex-col gap-6 pt-10 sm:flex-row-reverse sm:items-start sm:justify-between sm:space-y-0">
      {children}
    </div>
  )
}
