import { PageHeaderInfo } from "@/src/components/core/components/PageHeader/PageHeaderInfo"
import { PageHeaderLayout } from "@/src/components/core/components/PageHeader/PageHeaderLayout"
import {
  PageHeaderViewSwitch,
  type ViewMode,
} from "@/src/components/core/components/PageHeader/PageHeaderViewSwitch"

type Props = {
  breadcrumb?: React.ReactNode
  info?: React.ReactNode
  tabs?: React.ReactNode
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  title?: string
  action?: React.ReactNode
  filters?: React.ReactNode
  primaryAction?: React.ReactNode
  className?: string
}

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

  const row1Right =
    action || info ? (
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {info ? <PageHeaderInfo>{info}</PageHeaderInfo> : null}
      </div>
    ) : undefined

  const row2Right = hasViewSwitch ? (
    <PageHeaderViewSwitch value={viewMode} onChange={onViewModeChange} />
  ) : undefined

  const row3Left = title ? (
    <h1 className="text-base font-semibold text-gray-900 sm:truncate">{title}</h1>
  ) : undefined

  return (
    <PageHeaderLayout
      className={className}
      row1={{ left: breadcrumb, right: row1Right }}
      row2={{ left: tabs, right: row2Right }}
      row3={{ left: row3Left }}
      row4={{ left: filters, right: primaryAction }}
    />
  )
}
