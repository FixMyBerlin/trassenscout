import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"

type Props = {
  children: ReactNode
  className?: string
}

export const H1 = ({ className, children }: Props) => {
  return <h1 className={twJoin("text-2xl font-bold sm:text-3xl", className)}>{children}</h1>
}

export const H2 = ({ className, children }: Props) => {
  return <h2 className={twJoin("text-xl font-bold sm:text-2xl", className)}>{children}</h2>
}

export const H3 = ({ className, children }: Props) => {
  return <h2 className={twJoin("text-base font-bold sm:text-lg", className)}>{children}</h2>
}
