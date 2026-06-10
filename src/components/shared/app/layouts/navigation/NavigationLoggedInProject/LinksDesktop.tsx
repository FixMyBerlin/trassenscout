import { useLocation } from "@tanstack/react-router"
import { clsx } from "clsx"
import { Link } from "@/src/components/core/components/links/Link"
import { shouldHighlight, useMenuItems } from "./useMenuItems"

type Props = { menuItems: ReturnType<typeof useMenuItems> }

export const LinksDesktop = ({ menuItems }: Props) => {
  const { pathname } = useLocation()

  return (
    <div className="flex gap-4">
      {menuItems?.map((item) => {
        const current = shouldHighlight(item, pathname)

        return (
          <Link
            key={item.name}
            to={item.href}
            classNameOverwrites={clsx(
              current
                ? "bg-gray-300 text-gray-900"
                : "text-gray-50 hover:bg-gray-100 hover:text-gray-900",
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
