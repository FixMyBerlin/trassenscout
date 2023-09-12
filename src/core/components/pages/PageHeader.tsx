import clsx from "clsx"
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

export const PageHeader: React.FC<Props> = ({
  titleIcon,
  title,
  subtitle,
  description,
  action,
  className,
}) => {
  const styledDescription =
    typeof description === "string" ? (
      <p className="mt-5 text-base text-gray-500">{description}</p>
    ) : (
      description
    )
  return (
    <section className={clsx("mb-12", className)}>
      <div className="mt-5 flex items-start justify-between">
        <div className="flex gap-3 items-start">
          {titleIcon && (
            <span style={{ zoom: 1.8 }} className="mb-1 shrink-0">
              {titleIcon}
            </span>
          )}
          <H1>{title}</H1>
        </div>
        {Boolean(action) && <div>{action}</div>}
      </div>

      {Boolean(subtitle) && <H2 className="mt-3">{subtitle}</H2>}
      {Boolean(description) && styledDescription}

      <DashedLine />
    </section>
  )
}
