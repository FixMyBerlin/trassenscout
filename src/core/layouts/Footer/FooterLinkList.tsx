import clsx from "clsx"
import React from "react"
import { Link } from "src/core/components/links"
import { FooterMenuItem } from "./Footer"

type Props = {
  linkList: FooterMenuItem[]
  className?: string
}

export const FooterLinkList: React.FC<Props> = ({ linkList, className }) => {
  return (
    <ul className={clsx("space-y-3", className)}>
      {linkList.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            blank={item.blank}
            className="font-apercuMono block text-[14px] leading-5 text-white no-underline decoration-white decoration-1 "
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
