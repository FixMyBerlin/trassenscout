import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { FooterLink } from "./links.const"

type Props = {
  title: string
  linkList: FooterLink<string>[]
  className?: string
}

export const FooterLinkList = ({ title, linkList, className }: Props) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase text-gray-400">{title}</p>
      <ul className={twJoin("space-y-3", className)}>
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
