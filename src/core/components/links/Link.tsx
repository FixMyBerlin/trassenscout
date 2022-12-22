import React from "react"
import clsx from "clsx"
import NextLink from "next/link"
import { RouteUrlObject } from "blitz"

const baseStyles =
  "text-slate-900 underline-offset-4 underline decoration-indigo-500 hover:text-indigo-500"
export const linkStyles = `${baseStyles} underline`
export const buttonStyles = `${baseStyles} rounded-full border border-indigo-500 px-6 pt-4 pb-3`

type Props = {
  href: RouteUrlObject
  className?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: boolean
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const Link: React.FC<Props> = ({
  href,
  className,
  children,
  blank = false,
  button,
  ...props
}) => {
  return (
    <NextLink href={href} {...{ target: blank ? "_blank" : undefined }} {...props}>
      {/* TODO remove a-tag one React 13 can be used. */}
      <a className={clsx(button ? buttonStyles : linkStyles, className)}>{children}</a>
    </NextLink>
  )
}
