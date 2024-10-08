import { ArrowDownTrayIcon, ListBulletIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid"
import { PencilIcon } from "@heroicons/react/24/outline"
import { RouteUrlObject } from "blitz"
import { clsx } from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"
import { UrlObject } from "url"
import { selectLinkStyle } from "./styles"

export type LinkProps = {
  href: RouteUrlObject | UrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "blue" | "white" | "pink"
  icon?: keyof typeof linkIcons
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const linkIcons = {
  plus: <PlusIcon className="h-3.5 w-3.5" />,
  edit: <PencilIcon className="h-3.5 w-3.5" />,
  download: <ArrowDownTrayIcon className="h-3.5 w-3.5" />,
  delete: <TrashIcon className="h-3.5 w-3.5" />,
  list: <ListBulletIcon className="h-3.5 w-3.5" />,
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, className, classNameOverwrites, children, blank = false, button, icon, ...props },
  ref,
) {
  const classNames = clsx(
    icon ? "inline-flex items-center justify-center gap-1" : "", // base styles for icon case
    icon && button ? "pl-5" : "", // overwrites to `buttonBase` for icon case
    classNameOverwrites ?? selectLinkStyle(button, className),
  )

  // external link
  if (typeof href === "string") {
    return (
      <a
        ref={ref}
        href={href}
        className={classNames}
        rel="noopener noreferrer"
        {...{ target: blank ? "_blank" : undefined }}
        {...props}
      >
        {icon && linkIcons[icon]}
        {children}
      </a>
    )
  }

  return (
    <NextLink
      href={href}
      ref={ref}
      className={classNames}
      {...props}
      {...{ target: blank ? "_blank" : undefined }}
    >
      {icon && linkIcons[icon]}
      {children}
    </NextLink>
  )
})
