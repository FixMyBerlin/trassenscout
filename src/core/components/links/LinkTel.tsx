import clsx from "clsx"
import { buttonStyles, linkStyles } from "./Link"

type Props = {
  className?: string
  tel?: string
  /** @desc Style Link as Button */
  button?: boolean
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const LinkTel: React.FC<Props> = ({ className, tel, button, children, ...props }) => {
  return (
    <a
      href={`tel:${tel || children}`}
      className={clsx(button ? buttonStyles : linkStyles, className)}
      {...props}
    >
      {children}
    </a>
  )
}
