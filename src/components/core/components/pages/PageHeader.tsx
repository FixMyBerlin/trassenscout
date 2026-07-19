import { twJoin } from "tailwind-merge"
import { PageHeaderInfo } from "@/src/components/core/components/pages/PageHeaderInfo"
import { PageHeaderViewSwitch } from "@/src/components/core/components/pages/PageHeaderViewSwitch"

type Props = {
  breadcrumb?: React.ReactNode
  /** Page-specific info panel content. Renders the info button when provided. */
  info?: React.ReactNode
  tabs?: React.ReactNode
  viewSwitch?: boolean
  title?: string
  action?: React.ReactNode
  className?: string
}

const rowClassName = "flex h-12 items-center justify-between gap-4 border-b border-gray-200 px-4"

export const PageHeader = ({
  breadcrumb,
  info,
  tabs,
  viewSwitch,
  title,
  action,
  className,
}: Props) => {
  const hasRow1 = Boolean(breadcrumb || info || action)
  const hasRow2 = Boolean(tabs || viewSwitch)
  const hasRow3 = Boolean(title)

  if (!hasRow1 && !hasRow2 && !hasRow3) return null

  return (
    <header className={twJoin("mb-6 w-full", className)}>
      {hasRow1 ? (
        <div className={twJoin(rowClassName, "bg-gray-50")}>
          <div className="min-w-0 flex-1">{breadcrumb}</div>
          {action || info ? (
            <div className="flex shrink-0 items-center gap-2">
              {action}
              {info ? <PageHeaderInfo>{info}</PageHeaderInfo> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasRow2 ? (
        <div className={twJoin(rowClassName, "bg-white")}>
          <div className="min-w-0 flex-1">{tabs}</div>
          {viewSwitch ? <PageHeaderViewSwitch /> : null}
        </div>
      ) : null}

      {hasRow3 ? (
        <div className={twJoin(rowClassName, "bg-white")}>
          <div className="min-w-0 flex-1">
            {title ? (
              <h1 className="text-base font-bold text-gray-900 sm:truncate">{title}</h1>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
