import clsx from "clsx"
import { useRouter } from "next/router"
import React from "react"
import { Link } from "src/core/components/links"
import { menuItems } from "../NavigationProject/menuItems"

type Props = { menuItems: ReturnType<typeof menuItems> }

export const NavigationDesktopLinks: React.FC<Props> = ({ menuItems }) => {
  const { pathname } = useRouter()

  const itemClasses = (current: boolean) =>
    clsx(
      current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
      "rounded-md px-3 py-2 text-sm font-medium"
    )

  return (
    <div className="flex space-x-4">
      {menuItems?.map((item) => {
        const current = [item.href.pathname, ...(item.alsoHighlightPathnames || [])].includes(
          pathname
        )

        return (
          <Link
            key={item.name}
            href={item.href}
            classNameOverwrites={itemClasses(current)}
            aria-current={current ? "page" : undefined}
          >
            {item.name}
          </Link>
        )
      })}
    </div>
  )
}
