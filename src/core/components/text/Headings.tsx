import clsx from "clsx"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export const H1: React.FC<Props> = ({ className, children }) => {
  return <h1 className={clsx("text-[42px] font-extrabold", className)}>{children}</h1>
}

export const H2: React.FC<Props> = ({ className, children }) => {
  return <h2 className={clsx("text-[32px] font-extrabold", className)}>{children}</h2>
}
