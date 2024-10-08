"use client"
import { Link } from "@/src/core/components/links"
import { clsx } from "clsx"
import { usePathname } from "next/navigation"
import { shouldHighlight, useMenuItems } from "./useMenuItems"

type Props = { menuItems: ReturnType<typeof useMenuItems> }

export const LinksDesktop = ({ menuItems }: Props) => {
  const pathname = usePathname()

  return (
    <div className="flex gap-4">
      {menuItems?.map((item) => {
        const current = shouldHighlight(item, pathname)

        return (
          <Link
            key={item.name}
            href={item.href}
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
