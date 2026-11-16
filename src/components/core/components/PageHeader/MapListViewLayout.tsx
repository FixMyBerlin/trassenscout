import { type ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import type { ViewMode } from "@/src/components/core/components/PageHeader/PageHeaderViewSwitch"

/** Height class for maps inside the flex map-mode shell (parent uses h-[calc(100dvh-4rem)]). */
export const MAP_FULLSCREEN_HEIGHT_CLASS = "min-h-0 flex-1"
/** Outer shell: viewport minus top nav (4rem). Parent of PageHeader + map content. */
export const MAP_VIEWPORT_SHELL_CLASS = "flex h-[calc(100dvh-4rem)] flex-col overflow-hidden"

type MapAsideSplitLayoutProps = {
  aside: ReactNode
  map: ReactNode
  className?: string
  asideClassName?: string
  /** "end" puts the map first (left from lg, above the aside below lg). @default "start" */
  asideSide?: "start" | "end"
}

export function MapAsideSplitLayout({
  aside,
  map,
  className,
  asideClassName,
  asideSide = "start",
}: MapAsideSplitLayoutProps) {
  const asideElement = (
    <aside
      className={twJoin(
        "min-h-0 w-full overflow-y-auto lg:h-full lg:w-[45%] lg:shrink-0",
        asideClassName,
      )}
    >
      {aside}
    </aside>
  )
  const mapElement = (
    <div
      className={twJoin(
        "flex min-h-0 min-w-0 flex-1 flex-col border-gray-200",
        asideSide === "start"
          ? "border-t lg:border-t-0 lg:border-l"
          : "border-b lg:border-r lg:border-b-0",
      )}
    >
      {map}
    </div>
  )

  return (
    <div
      className={twJoin(
        "relative flex h-full min-h-0 w-full flex-col lg:flex-row lg:items-stretch",
        className,
      )}
    >
      {asideSide === "start" ? (
        <>
          {asideElement}
          {mapElement}
        </>
      ) : (
        <>
          {mapElement}
          {asideElement}
        </>
      )}
    </div>
  )
}

type ListRenderOptions = {
  /** When false, list is for screen readers only (map mode): readable, not navigable. */
  interactive: boolean
}

type Props = {
  mode: ViewMode
  map: ReactNode | ((classHeight: string) => ReactNode)
  list: (options: ListRenderOptions) => ReactNode
  children?: ReactNode
  className?: string
}

function renderMap(map: Props["map"], classHeight: string) {
  return typeof map === "function" ? map(classHeight) : map
}

export function MapListViewLayout({ mode, map, list, children, className }: Props) {
  const isMapMode = mode === "map"

  return (
    <div className={twJoin(isMapMode && "flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        className={twJoin(isMapMode ? "flex min-h-0 flex-1 flex-col" : "hidden")}
        aria-hidden={!isMapMode}
      >
        {renderMap(map, MAP_FULLSCREEN_HEIGHT_CLASS)}
      </div>

      {isMapMode ? (
        <div className="sr-only overflow-hidden">{list({ interactive: false })}</div>
      ) : (
        list({ interactive: true })
      )}

      {children ? (
        <div className={twJoin(isMapMode && "hidden")} aria-hidden={isMapMode}>
          {children}
        </div>
      ) : null}
    </div>
  )
}
