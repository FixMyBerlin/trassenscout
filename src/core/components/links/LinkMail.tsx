import { LinkProps } from "./Link"
import { selectLinkStyle } from "./styles"

type Props = {
  className?: string
  mailto?: string
  subject?: string
  /** @desc Style Link as Button */
  button?: LinkProps["button"]
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
    <a href={url.href} className={selectLinkStyle(button, className)} {...props}>
      {children}
    </a>
  )
}
