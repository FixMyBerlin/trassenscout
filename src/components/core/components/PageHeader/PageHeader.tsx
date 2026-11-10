import { PageHeaderInfo } from "@/src/components/core/components/PageHeader/PageHeaderInfo"
import { PageHeaderLayout } from "@/src/components/core/components/PageHeader/PageHeaderLayout"
import { PageHeaderRowActions } from "@/src/components/core/components/PageHeader/PageHeaderRowActions"
import {
  PageHeaderViewSwitch,
  type ViewMode,
} from "@/src/components/core/components/PageHeader/PageHeaderViewSwitch"

type Props = {
  breadcrumb?: React.ReactNode
  info?: React.ReactNode
  tabs?: React.ReactNode
  search?: React.ReactNode
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  title?: string
  titleVisuallyHidden?: boolean
  action?: React.ReactNode
  filters?: React.ReactNode
  filtersAction?: React.ReactNode
  /** Row 2 actions on the right (e.g. CSV download, create buttons). */
  primaryAction?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  breadcrumb,
  info,
  tabs,
  search,
  viewMode,
  onViewModeChange,
  title,
  titleVisuallyHidden = false,
  action,
  filters,
  filtersAction,
  primaryAction,
  className,
}: Props) => {
  const hasViewSwitch = viewMode !== undefined && onViewModeChange !== undefined
  const viewSwitch = hasViewSwitch ? (
    <PageHeaderViewSwitch value={viewMode} onChange={onViewModeChange} />
  ) : null
  // Without tabs the switch leads row 2, before the search; tab rows keep it on the right.
  const switchLeadsRow2 = hasViewSwitch && !tabs

  const row1Right =
    action || info ? (
      <PageHeaderRowActions>
        {action}
        {info ? <PageHeaderInfo>{info}</PageHeaderInfo> : null}
      </PageHeaderRowActions>
    ) : undefined

  const row2Left = switchLeadsRow2 ? (
    <div className="flex min-w-0 items-center gap-3">
      {viewSwitch}
      {search}
    </div>
  ) : (
    (tabs ?? search)
  )

  const row2Right =
    (hasViewSwitch && !switchLeadsRow2) || primaryAction ? (
      <PageHeaderRowActions>
        {primaryAction}
        {switchLeadsRow2 ? null : viewSwitch}
      </PageHeaderRowActions>
    ) : undefined

  const row3Left =
    title && !titleVisuallyHidden ? (
      <h1 className="text-base font-semibold text-gray-900 sm:truncate" title={title}>
        {title}
      </h1>
    ) : undefined

  return (
    <>
      {title && titleVisuallyHidden ? <h1 className="sr-only">{title}</h1> : null}
      <PageHeaderLayout
        className={className}
        row1={{ left: breadcrumb, right: row1Right }}
        row2={{ left: row2Left, right: row2Right }}
        row3={{ left: row3Left }}
        row4={{ left: filters, right: filtersAction }}
      />
    </>
  )
}
