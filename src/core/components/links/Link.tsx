import { MagnifyingGlassPlusIcon } from "@heroicons/react/16/solid"
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ListBulletIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid"
import { ArrowTopRightOnSquareIcon, PencilIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { Route } from "next"
import NextLink from "next/link"
import { forwardRef } from "react"
import { twMerge } from "tailwind-merge"
import { UrlObject } from "url"
import { selectLinkStyle } from "./styles"

export type LinkProps = {
  href: Route | UrlObject | string
  prefetch?: boolean
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "blue" | "white" | "pink"
  icon?: keyof typeof linkIcons | React.ReactNode
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const linkIcons = {
  back: <ArrowLeftIcon className="size-3.5" />,
  plus: <PlusIcon className="size-3.5" />,
  edit: <PencilIcon className="size-3.5" />,
  download: <ArrowDownTrayIcon className="size-3.5" />,
  delete: <TrashIcon className="size-3.5" />,
  list: <ListBulletIcon className="size-3.5" />,
  details: <MagnifyingGlassPlusIcon className="size-4" />,
  action: <ArrowTopRightOnSquareIcon className="size-3.5" />,
  collaboration: <UserGroupIcon className="-ml-0.5 size-5" />,
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    className,
    classNameOverwrites,
    children,
    blank = false,
    button,
    icon,
    prefetch,
    ...props
  },
  ref,
) {
  const classNames = twMerge(
    icon ? "inline-flex items-center justify-center gap-1" : "", // base styles for icon case
    icon && button ? "pl-5" : "", // overwrites to `buttonBase` for icon case
    classNameOverwrites ?? selectLinkStyle(button, className),
  )

  // Determine if icon is a React component or a string key
  const iconElement =
    icon && typeof icon === "string" && icon in linkIcons
      ? linkIcons[icon as keyof typeof linkIcons]
      : icon
        ? (icon as React.ReactNode)
        : null

  // external link
  if (typeof href === "string" && !href.startsWith("/")) {
    return (
      <a
        ref={ref}
        href={href}
        className={classNames}
        rel="noopener noreferrer"
        {...{ target: blank ? "_blank" : undefined }}
        {...props}
      >
        {iconElement}
        {children}
      </a>
    )
  }

  return (
    <NextLink
      prefetch={prefetch}
      href={href as Route}
      ref={ref}
      className={classNames}
      {...props}
      {...{ target: blank ? "_blank" : undefined }}
    >
      {iconElement}
      {children}
    </NextLink>
  )
})
