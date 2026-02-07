import { Link } from "@/src/core/components/links"
import { clsx } from "clsx"
import { Route } from "next"

type TSurveyFooterLink = {
  name: string
  href: Route | string
  blank: boolean
}

type Props = {
  linkList: TSurveyFooterLink[]
  className?: string
}

export const SurveyFooterLinkList = ({ linkList, className }: Props) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-400">RECHTLICHES</p>
      <ul className={clsx("space-y-3", className)}>
        {linkList.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
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
