"use client"
import { CurrentUserCanIcon } from "@/src/pagesComponents/memberships/CurrentUserCanIcon"
import { clsx } from "clsx"
import { useTryProjectSlug } from "../../routes/useProjectSlug"
import { DashedLine } from "../DashedLine"
import { H1, H2 } from "../text/Headings"

type Props = {
  titleIcon?: React.ReactNode
  title: string
  subtitle?: string | null
  description?: string | React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  titleIcon,
  title,
  subtitle,
  description,
  action,
  className,
}: Props) => {
  const projectSlug = useTryProjectSlug()

  const styledDescription =
    typeof description === "string" ? (
      <p className="mt-5 text-base text-gray-500">{description}</p>
    ) : (
      description
    )

  return (
    <section className={clsx("mb-12 space-y-3", className)}>
      {(titleIcon || action) && (
        <div className="mt-5 flex items-start justify-between">
          {/* empty span should be rendered if no title icon to keep position of action */}
          <span style={{ zoom: 1.8 }} className="mb-1 shrink-0">
            {titleIcon}
          </span>
          <div className="flex items-center gap-2">
            {action} <CurrentUserCanIcon projectSlug={projectSlug!} />
          </div>
        </div>
      )}
      <div>
        <H1>{title}</H1>

        {Boolean(subtitle) && <H2 className="mt-3">{subtitle}</H2>}
        {Boolean(description) && styledDescription}

        <DashedLine />
      </div>
    </section>
  )
}
