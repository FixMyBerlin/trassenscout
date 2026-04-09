"use client"

import { clsx } from "clsx"
import { H1, H2 } from "../text/Headings"

type Props = {
  titleIcon?: React.ReactNode
  titleIconZoom?: number
  title?: string
  subtitle?: string | null
  description?: string | React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  titleIcon,
  titleIconZoom = 1.8,
  title,
  subtitle,
  description,
  action,
  className,
}: Props) => {
  const styledDescription =
    typeof description === "string" ? (
      <p className="mt-5 text-base text-gray-500">{description}</p>
    ) : (
      description
    )

  return (
    <section className={clsx("mb-12 space-y-3", className)}>
      {(titleIcon || action) && (
        <div
          className={clsx(
            "mt-5 flex items-start",
            action && "justify-between",
          )}
        >
          {/* empty span should be rendered if no title icon to keep position of action */}
          <div className="flex items-center gap-3">
            <span style={{ zoom: titleIconZoom }} className="mb-1 shrink-0">
              {titleIcon}
            </span>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {(title || subtitle || description) && (
        <div>
          {Boolean(title) && <H1>{title}</H1>}
          {Boolean(subtitle) && <H2 className="mt-3">{subtitle}</H2>}
          {Boolean(description) && styledDescription}
        </div>
      )}
    </section>
  )
}
