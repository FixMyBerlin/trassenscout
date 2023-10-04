import clsx from "clsx"
import React from "react"
import { Link } from "src/core/components/links"
import { FooterLink } from "./links.const"

type Props = {
  linkList: FooterLink[]
  className?: string
}

export const FooterLinkList: React.FC<Props> = ({ linkList, className }) => {
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
