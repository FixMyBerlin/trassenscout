import { twJoin } from "tailwind-merge"

type Props = {
  breadcrumb?: React.ReactNode
  /** Text headline — use `heading` for pills, icons, or other custom title UI. */
  title?: string
  heading?: React.ReactNode
  subtitle?: string | React.ReactNode
  description?: string | React.ReactNode
  action?: React.ReactNode
  className?: string
}

const renderLeadingLine = (content: string | React.ReactNode) =>
  typeof content === "string" ? <p className="text-sm text-gray-500">{content}</p> : content

export const PageHeader = ({
  breadcrumb,
  title,
  heading,
  subtitle,
  description,
  action,
  className,
}: Props) => {
  const headline = heading
  const hasLeading = Boolean(subtitle || description)
  const hasActions = Boolean(action)

  return (
    <header className={twJoin("mb-12", className)}>
      <div className={twJoin(hasActions ? "lg:flex lg:items-center lg:justify-between" : "")}>
        <div className="min-w-0 flex-1">
          {breadcrumb}

          {headline ? (
            <div className={twJoin("w-fit max-w-full", breadcrumb ? "mt-2" : undefined)}>
              {headline}
            </div>
          ) : title ? (
            <h1
              className={twJoin(
                "text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight",
                breadcrumb ? "mt-2" : undefined,
              )}
            >
              {title}
            </h1>
          ) : null}

          {hasLeading && (
            <div
              className={twJoin(
                "flex flex-col gap-1",
                title || headline ? "mt-3" : breadcrumb ? "mt-2" : undefined,
              )}
            >
              {subtitle ? renderLeadingLine(subtitle) : null}
              {description ? renderLeadingLine(description) : null}
            </div>
          )}
        </div>

        {hasActions ? (
          <div className="mt-5 flex shrink-0 items-center gap-2 lg:mt-0 lg:ml-4">{action}</div>
        ) : null}
      </div>
    </header>
  )
}
