import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"

const baseStyles = "text-slate-900 underline-offset-4 decoration-rsv-blau hover:text-rsv-blau"
export const linkStyles = `${baseStyles} underline`
export const buttonStyles = `${baseStyles} rounded-full border border-rsv-blau px-6 pt-4 pb-3 disabled:text-gray-400 disabled:border-gray-300 hover:bg-blue-50`

type Props = {
  href: RouteUrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: boolean
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const Link: React.FC<Props> = forwardRef<HTMLAnchorElement, Props>(
  ({ href, className, classNameOverwrites, children, blank = false, button, ...props }, ref) => {
    // external link
    if (typeof href === "string") {
      return (
        <a
          ref={ref}
          href={href}
          className={classNameOverwrites || clsx(button ? buttonStyles : linkStyles, className)}
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
          className={classNameOverwrites || clsx(button ? buttonStyles : linkStyles, className)}
          {...props}
        >
          {children}
        </a>
      </NextLink>
    )
  }
)
