import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"
import { selectSurveyLinkStyle } from "./styles"

// the link component is duplicated to avoid dependencies between TS and 'Beteiligung'

export type SurveyLinkProps = {
  href: RouteUrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "white" | "pink"
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const SurveyLink: React.FC<SurveyLinkProps> = forwardRef<HTMLAnchorElement, SurveyLinkProps>(
  ({ href, className, classNameOverwrites, children, blank = false, button, ...props }, ref) => {
    const classNames = clsx(classNameOverwrites ?? selectSurveyLinkStyle(button, className))

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
      <NextLink
        href={href}
        ref={ref}
        className={classNames}
        {...props}
        {...{ target: blank ? "_blank" : undefined }}
      >
        {children}
      </NextLink>
    )
  },
)
