import { clsx } from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const SurveyH1: React.FC<Props> = ({ className, children }) => {
  return (
    <h1 className={clsx("mt-10 mb-6 text-2xl font-bold text-gray-900", className)}>{children}</h1>
  )
}

export const SurveyH2: React.FC<Props> = ({ className, children }) => {
  return (
    <h2 className={clsx("mt-12 mb-4 text-lg font-bold text-gray-900 sm:text-xl", className)}>
      {children}
    </h2>
  )
}

export const SurveyH3: React.FC<Props> = ({ className, children }) => {
  return (
    <h3 className={clsx("mt-12 mb-4 text-lg font-bold text-gray-900", className)}>{children}</h3>
  )
}

export const SurveyP: React.FC<Props> = ({ className, children }) => {
  return <p className={clsx("my-8 text-base text-gray-700", className)}>{children}</p>
}
