import clsx from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const SurveyH1: React.FC<Props> = ({ className, children }) => {
  return (
    <h1 className={clsx("mb-6 pt-10 text-2xl font-extrabold text-gray-900 sm:text-3xl", className)}>
      {children}
    </h1>
  )
}

export const SurveyH2: React.FC<Props> = ({ className, children }) => {
  return (
    <h2 className={clsx("mb-4 pt-8 text-lg font-extrabold text-gray-900 sm:text-xl", className)}>
      {children}
    </h2>
  )
}

export const SurveyH3: React.FC<Props> = ({ className, children }) => {
  return (
    <h3 className={clsx("mb-4 pt-8 text-lg font-extrabold text-gray-900", className)}>
      {children}
    </h3>
  )
}

export const SurveyP: React.FC<Props> = ({ className, children }) => {
  return <p className={clsx("text-base text-gray-700 sm:text-lg", className)}>{children}</p>
}
