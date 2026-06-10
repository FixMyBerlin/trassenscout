import { clsx } from "clsx"
import { Link } from "@/src/components/core/components/links/Link"
import { FooterLink } from "./links.const"

type Props = {
  linkList: FooterLink<string>[]
  className?: string
}

export const FooterLinkList = ({ linkList, className }: Props) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-400">RECHTLICHES</p>
      <ul className={clsx("space-y-3", className)}>
        {linkList.map((item) => (
          <li key={item.name}>
            <Link
              to={item.href}
              blank={item.blank}
              classNameOverwrites="text-sm text-gray-400 hover:underline"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
