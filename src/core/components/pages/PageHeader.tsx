import clsx from "clsx"
import { DashedLine } from "../DashedLine"
import { H1, H2 } from "../text/Headings"

type Props = {
  titleIcon?: React.ReactNode
  title: string
  subtitle?: string | null
  description?: string
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
  return (
    <section className={clsx("mb-12", className)}>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {titleIcon && (
            <span style={{ zoom: 1.8 }} className="mb-1">
              {titleIcon}
            </span>
          )}
          <H1>{title}</H1>
        </div>
        {Boolean(action) && <div>{action}</div>}
      </div>

      {Boolean(subtitle) && <H2 className="mt-3">{subtitle}</H2>}
      {Boolean(description) && <p className="mt-5 text-base text-gray-500">{description}</p>}

      <DashedLine />
    </section>
  )
}
