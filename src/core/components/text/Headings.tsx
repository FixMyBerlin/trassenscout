import clsx from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const H1 = ({ className, children }: Props) => {
  return <h1 className={clsx("text-3xl font-extrabold sm:text-5xl", className)}>{children}</h1>
}

export const H2 = ({ className, children }: Props) => {
  return <h2 className={clsx("text-xl font-extrabold sm:text-2xl", className)}>{children}</h2>
}

export const H3 = ({ className, children }: Props) => {
  return <h2 className={clsx("text-base font-extrabold sm:text-lg", className)}>{children}</h2>
}
