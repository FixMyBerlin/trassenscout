import { clsx } from "clsx"

type Props = {
  breadcrumb?: React.ReactNode
  /** Text headline — use `heading` for pills, icons, or other custom title UI. */
  title?: string
  heading?: React.ReactNode
  /** @deprecated Use `heading` instead. */
  titleIcon?: React.ReactNode
  subtitle?: string | React.ReactNode
  description?: string | React.ReactNode
  action?: React.ReactNode
  className?: string
}

const renderLeadingLine = (content: string | React.ReactNode) =>
  typeof content === "string" ? (
    <p className="text-sm text-gray-500">{content}</p>
  ) : (
    <div className="text-sm text-gray-500">{content}</div>
  )

export const PageHeader = ({
  breadcrumb,
  title,
  heading,
  titleIcon,
  subtitle,
  description,
  action,
  className,
}: Props) => {
  const headline = heading ?? titleIcon
  const hasHeadline = Boolean(title || headline)
  const hasLeading = Boolean(subtitle || description)
  const hasActions = Boolean(action)

  return (
    <header className={clsx("mb-12", className)}>
      <div className={clsx(hasActions && "lg:flex lg:items-center lg:justify-between")}>
        <div className="min-w-0 flex-1">
          {breadcrumb}

          {headline ? (
            <div className={clsx("w-fit max-w-full", breadcrumb ? "mt-2" : undefined)}>
              {headline}
            </div>
          ) : title ? (
            <h1
              className={clsx(
                "text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight",
                breadcrumb ? "mt-2" : undefined,
              )}
            >
              {title}
            </h1>
          ) : (
            hasLeading && (
              <div className={clsx("flex flex-col gap-1", hasHeadline ? "mt-1" : "mt-2")}>
                {subtitle
                  ? renderLeadingLine(subtitle)
                  : description
                    ? renderLeadingLine(description)
                    : null}
              </div>
            )
          )}
        </div>

        {hasActions ? (
          <div className="mt-5 flex shrink-0 items-center gap-2 lg:mt-0 lg:ml-4">{action}</div>
        ) : null}
      </div>
    </header>
  )
}
