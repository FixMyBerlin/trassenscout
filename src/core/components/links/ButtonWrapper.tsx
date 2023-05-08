import clsx from "clsx"
import React from "react"

type Props = { className?: string; children: React.ReactNode }

export const ButtonWrapper: React.FC<Props> = ({ className, children }) => {
  return <div className={clsx(className, "flex items-center gap-3")}>{children}</div>
}
