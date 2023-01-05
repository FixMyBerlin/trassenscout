import React from "react"
import clsx from "clsx"
import NextLink from "next/link"
import { RouteUrlObject } from "blitz"

const baseStyles =
  "text-slate-900 underline-offset-4 underline decoration-rsv-blau hover:text-rsv-blau"
export const linkStyles = `${baseStyles} underline`
export const buttonStyles = `${baseStyles} rounded-full border border-rsv-blau px-6 pt-4 pb-3`

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

export const Link: React.FC<Props> = ({
  href,
  className,
  classNameOverwrites,
  children,
  blank = false,
  button,
  ...props
}) => {
  // external link
  if (typeof href === "string") {
    return (
      <a
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
    <NextLink href={href} {...{ target: blank ? "_blank" : undefined }} {...props}>
      {/* TODO remove a-tag one React 13 can be used. */}
      <a className={classNameOverwrites || clsx(button ? buttonStyles : linkStyles, className)}>
        {children}
      </a>
    </NextLink>
  )
}
