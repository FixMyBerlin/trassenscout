import clsx from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const ParticipationH1: React.FC<Props> = ({ className, children }) => {
  return (
    <h1
      className={clsx(
        "mb-8 pt-10 text-3xl font-extrabold text-gray-900 sm:text-5xl md:text-4xl",
        className,
      )}
    >
      {children}
    </h1>
  )
}

export const ParticipationH2: React.FC<Props> = ({ className, children }) => {
  return (
    <h2 className={clsx("mb-6 pt-12 text-2xl font-extrabold text-gray-900 sm:text-3xl", className)}>
      {children}
    </h2>
  )
}

export const ParticipationH3: React.FC<Props> = ({ className, children }) => {
  return (
    <h3 className={clsx("mb-6 pt-12 text-xl font-extrabold text-gray-900 sm:text-2xl", className)}>
      {children}
    </h3>
  )
}

export const ParticipationP: React.FC<Props> = ({ className, children }) => {
  return <p className={clsx("text-base text-gray-700 sm:text-lg", className)}>{children}</p>
}
