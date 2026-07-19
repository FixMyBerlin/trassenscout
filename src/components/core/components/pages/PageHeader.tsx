import { twJoin, twMerge } from "tailwind-merge"
import { PageHeaderInfo } from "@/src/components/core/components/pages/PageHeaderInfo"
import {
  PageHeaderViewSwitch,
  type ViewMode,
} from "@/src/components/core/components/pages/PageHeaderViewSwitch"

type Props = {
  breadcrumb?: React.ReactNode
  /** Page-specific info panel content. Renders the info button when provided. */
  info?: React.ReactNode
  tabs?: React.ReactNode
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  title?: string
  action?: React.ReactNode
  /** 4th row left: page filter UI */
  filters?: React.ReactNode
  /** 4th row right: primary create/action CTA */
  primaryAction?: React.ReactNode
  className?: string
}

const rowClassName = "flex h-12 items-center justify-between gap-4 border-b border-gray-200 px-4"

export const PageHeader = ({
  breadcrumb,
  info,
  tabs,
  viewMode,
  onViewModeChange,
  title,
  action,
  filters,
  primaryAction,
  className,
}: Props) => {
  const hasViewSwitch = viewMode !== undefined && onViewModeChange !== undefined
  const hasRow1 = Boolean(breadcrumb || info || action)
  const hasRow2 = Boolean(tabs || hasViewSwitch)
  const hasRow3 = Boolean(title)
  const hasRow4 = Boolean(filters || primaryAction)

  if (!hasRow1 && !hasRow2 && !hasRow3 && !hasRow4) return null

  return (
    <header className={twMerge("w-full", className)}>
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
          {hasViewSwitch ? (
            <PageHeaderViewSwitch value={viewMode} onChange={onViewModeChange} />
          ) : null}
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

      {hasRow4 ? (
        <div
          className={twJoin(
            "flex min-h-12 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2",
          )}
        >
          <div className="min-w-0 flex-1">{filters}</div>
          {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
        </div>
      ) : null}
    </header>
  )
}
