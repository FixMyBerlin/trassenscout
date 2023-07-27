import clsx from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const H1: React.FC<Props> = ({ className, children }) => {
  return <h1 className={clsx("text-3xl font-extrabold sm:text-5xl", className)}>{children}</h1>
}

export const H2: React.FC<Props> = ({ className, children }) => {
  return <h2 className={clsx("text-xl font-extrabold sm:text-2xl", className)}>{children}</h2>
}

export const H3: React.FC<Props> = ({ className, children }) => {
  return <h2 className={clsx("sm:text-lg font-extrabold text-base", className)}>{children}</h2>
}
