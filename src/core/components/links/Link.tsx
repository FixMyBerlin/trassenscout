import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"
import { selectLinkStyle } from "./styles"
import { PlusIcon } from "@heroicons/react/20/solid"
import { PencilIcon } from "@heroicons/react/24/outline"

export type LinkProps = {
  href: RouteUrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "blue" | "white" | "pink"
  icon?: keyof typeof icons
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

const icons = {
  plus: <PlusIcon className="h-4 w-4 pb-0.5" />,
  edit: <PencilIcon className="h-4 w-4 pb-0.5" />,
}

export const Link: React.FC<LinkProps> = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { href, className, classNameOverwrites, children, blank = false, button, icon, ...props },
    ref
  ) => {
    const classNames = clsx(
      { "gap-1 inline-flex justify-center items-center": icon }, // base styles for icon case
      { "pl-5 ": icon && button }, // overwrites to `buttonBase` for icon case
      classNameOverwrites ?? selectLinkStyle(button, className)
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
          {icon && icons[icon]}
          {children}
        </a>
      )
    }

    return (
      <NextLink href={href} {...{ target: blank ? "_blank" : undefined }}>
        {/*
          TODO remove a-tag one React 13 can be used.
          Also, update the `ref`, `{...props}`, see https://headlessui.com/react/menu#integrating-with-next-js
        */}
        <a ref={ref} className={classNames} {...props}>
          {icon && icons[icon]}
          {children}
        </a>
      </NextLink>
    )
  }
)
