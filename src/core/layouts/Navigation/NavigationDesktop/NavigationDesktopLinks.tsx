import clsx from "clsx"
import { useRouter } from "next/router"
import React from "react"
import { Link } from "src/core/components/links"
import { menuItems } from "../NavigationProject/menuItems"

type Props = { menuItems: ReturnType<typeof menuItems> }

export const NavigationDesktopLinks: React.FC<Props> = ({ menuItems }) => {
  const { pathname } = useRouter()

  return (
    <div className="flex gap-4">
      {menuItems?.map((item) => {
        const current = [item.href.pathname, ...(item.alsoHighlightPathnames || [])].includes(
          pathname,
        )

        return (
          <Link
            key={item.name}
            href={item.href}
            classNameOverwrites={clsx(
              current
                ? "bg-gray-300 text-gray-900"
                : "hover:bg-gray-100 text-gray-50 hover:text-gray-900",
              "rounded-md px-3 py-2 text-sm font-medium",
            )}
            aria-current={current ? "page" : undefined}
          >
            {item.name}
          </Link>
        )
      })}
    </div>
  )
}
