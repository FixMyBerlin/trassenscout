import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"
import { selectParticipationLinkStyle } from "./styles"

// the link component is duplicated to avoid dependencies between TS and 'Beteiligung'

export type ParticipationLinkProps = {
  href: RouteUrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "white" | "pink"
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const ParticipationLink: React.FC<ParticipationLinkProps> = forwardRef<
  HTMLAnchorElement,
  ParticipationLinkProps
>(({ href, className, classNameOverwrites, children, blank = false, button, ...props }, ref) => {
  const classNames = clsx(classNameOverwrites ?? selectParticipationLinkStyle(button, className))

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
        {children}
      </a>
    )
  }

  return (
    <NextLink href={href}>
      {/*
          TODO remove a-tag one React 13 can be used.
          Also, update the `ref`, `{...props}`, see https://headlessui.com/react/menu#integrating-with-next-js
        */}
      <a ref={ref} className={classNames} {...props} {...{ target: blank ? "_blank" : undefined }}>
        {children}
      </a>
    </NextLink>
  )
})
