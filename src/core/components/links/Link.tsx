import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"
import { selectLinkStyle } from "./styles"

export type LinkProps = {
  href: RouteUrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "blue" | "white"
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const Link: React.FC<LinkProps> = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, className, classNameOverwrites, children, blank = false, button, ...props }, ref) => {
    // external link
    if (typeof href === "string") {
      return (
        <a
          ref={ref}
          href={href}
          className={classNameOverwrites ?? clsx(button || selectLinkStyle(button, className))}
          rel="noopener noreferrer"
          {...{ target: blank ? "_blank" : undefined }}
          {...props}
        >
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
        <a
          ref={ref}
          className={classNameOverwrites || selectLinkStyle(button, className)}
          {...props}
        >
          {children}
        </a>
      </NextLink>
    )
  }
)
