import clsx from "clsx"
import Image from "next/image"
import React from "react"
import { Link } from "src/core/components/links"
import pngRsv8Logo from "./../Navigation/assets/rsv8-logo.png" // TODO
import { FooterMenuItemLogo } from "./Footer"

type Props = {
  logos: FooterMenuItemLogo[]
  className?: string
}

export const FooterLogos: React.FC<Props> = ({ logos, className }) => {
  return (
    <ul className={clsx("grid grid-cols-3 gap-5", className)}>
      {logos.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            blank={item.blank}
          >
            <Image
              src={pngRsv8Logo}
              width={48}
              height={48}
              className="block h-12 w-12"
              alt={item.name}
            />
            {/* TODO: dynamisieren */}
          </Link>
        </li>
      ))}
    </ul>
  )
}
