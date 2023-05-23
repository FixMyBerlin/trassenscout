import { LinkProps } from "./Link"
import { selectLinkStyle } from "./styles"

type Props = {
  className?: string
  tel?: string
  /** @desc Style Link as Button */
  button?: LinkProps["button"]
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const LinkTel: React.FC<Props> = ({ className, tel, button, children, ...props }) => {
  return (
    <a href={`tel:${tel || children}`} className={selectLinkStyle(button, className)} {...props}>
      {children}
    </a>
  )
}
