import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const ParticipationButtonWrapper: React.FC<Props> = ({ children }) => {
  return (
    <div className="sm flex flex-col gap-6 pt-10 sm:flex-row-reverse sm:justify-between sm:space-y-0">
      {children}
    </div>
  )
}
