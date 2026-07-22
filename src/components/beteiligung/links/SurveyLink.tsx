import { Link } from "@tanstack/react-router"
import { forwardRef } from "react"
import { twJoin } from "tailwind-merge"
import { selectSurveyLinkStyle } from "./styles"

export type SurveyLinkProps = {
  href: string
  className?: string
  classNameOverwrites?: string
  blank?: boolean
  button?: true | "white" | "primaryColor"
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export const SurveyLink = forwardRef<HTMLAnchorElement, SurveyLinkProps>(function SurveyLink(
  { href, className, classNameOverwrites, children, blank = false, button, ...props },
  ref,
) {
  const classNames = twJoin(
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--survey-dark-color)",
    classNameOverwrites ?? selectSurveyLinkStyle(button, className),
  )

  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a
        ref={ref}
        href={href}
        className={classNames}
        rel="noopener noreferrer"
        target={blank ? "_blank" : undefined}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      to={href}
      ref={ref}
      className={classNames}
      target={blank ? "_blank" : undefined}
      {...props}
    >
      {children}
    </Link>
  )
})
