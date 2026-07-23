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
}

export function MapAsideSplitLayout({
  aside,
  map,
  className,
  asideClassName,
}: MapAsideSplitLayoutProps) {
  return (
    <div
      className={twJoin(
        "relative flex h-full min-h-0 w-full flex-col lg:flex-row lg:items-stretch",
        className,
      )}
    >
      <aside
        className={twJoin(
          "min-h-0 w-full overflow-y-auto lg:h-full lg:w-[45%] lg:shrink-0",
          asideClassName,
        )}
      >
        {aside}
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-gray-200 lg:border-t-0 lg:border-l">
        {map}
      </div>
    </div>
  )
}

type Props = {
  mode: ViewMode
  map: ReactNode | ((classHeight: string) => ReactNode)
  list: ReactNode
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

      <div className={twJoin(isMapMode && "sr-only")} aria-hidden={isMapMode}>
        {list}
      </div>

      {children ? (
        <div className={twJoin(isMapMode && "hidden")} aria-hidden={isMapMode}>
          {children}
        </div>
      ) : null}
    </div>
  )
}
