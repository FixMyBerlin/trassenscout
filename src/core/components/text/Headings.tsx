import clsx from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const H1: React.FC<Props> = ({ className, children }) => {
  return (
    <h1 className={clsx("mb-5 pt-12 text-3xl font-extrabold sm:text-5xl", className)}>
      {children}
    </h1>
  )
}

export const H2: React.FC<Props> = ({ className, children }) => {
  return (
    <h2 className={clsx("mb-3 pt-10 text-xl font-extrabold sm:text-2xl", className)}>{children}</h2>
  )
}
