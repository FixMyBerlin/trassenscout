import React from "react"
import clsx from "clsx"
import { buttonStyles, linkStyles } from "./Link"

type Props = {
  className?: string
  mailto?: string
  subject?: string
  /** @desc Style Link as Button */
  button?: boolean
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const LinkMail: React.FC<Props> = ({
  className,
  mailto,
  subject,
  button,
  children,
  ...props
}) => {
  const url = new URL(`mailto:${mailto || children}`)
  if (subject) {
    url.searchParams.append("subject", subject)
  }

  return (
    <a
      href={`mailto:${url}`}
      className={clsx(button ? buttonStyles : linkStyles, className)}
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )
}
