import { Link } from "@/src/core/components/links"
import { RouteUrlObject } from "blitz"
import clsx from "clsx"

type TSurveyFooterLink = {
  name: string
  href: RouteUrlObject | string
  blank: boolean
}

type Props = {
  linkList: TSurveyFooterLink[]
  className?: string
}

export const SurveyFooterLinkList: React.FC<Props> = ({ linkList, className }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-400">RECHTLICHES</p>
      <ul className={clsx("space-y-3", className)}>
        {linkList.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              blank={item.blank}
              classNameOverwrites="text-gray-400 text-sm hover:underline"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
