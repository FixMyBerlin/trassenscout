import { layerColors } from "@/src/core/components/Map/layerColors"
import { ReactNode } from "react"

export type LegendItemConfig = {
  text: string
  color: string
  shape: "line" | "circle"
  dots?: boolean
}

type LegendProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapLegend = ({ legendItemsConfig }: LegendProps) => {
  if (!legendItemsConfig) return
  return (
    <LegendWrapper title="Kartenlegende">
      {legendItemsConfig.map((item) => {
        return item.shape === "line" ? (
          <LegendItem text={item.text} key={item.text}>
            <span className="relative h-2.5 w-8">
              {item.dots && (
                <>
                  <span
                    className="absolute z-10 size-2.5 rounded-full"
                    style={{ backgroundColor: layerColors.dot }}
                  />
                  <span
                    className="absolute left-6 z-10 size-2.5 rounded-full"
                    style={{ backgroundColor: layerColors.dot }}
                  />
                </>
              )}
              <span
                className="absolute top-px h-2 w-8 rounded border border-gray-500 bg-blue-500"
                style={{ backgroundColor: item.color }}
              />
            </span>
          </LegendItem>
        ) : (
          <LegendItem text={item.text} key={item.text}>
            <span className="relative size-[18px] flex-shrink-0">
              <span
                className="absolute inline-block size-[18px] rounded-full border-[3px]"
                style={{ borderColor: item.color }}
              />
              <span
                className="absolute inline-block size-[18px] rounded-full opacity-20"
                style={{ backgroundColor: item.color }}
              />
            </span>
          </LegendItem>
        )
      })}
    </LegendWrapper>
  )
}

type LegendWrapperProps = {
  title?: string
  children: ReactNode[]
}

export const LegendWrapper = ({ title = "Kartenlegende", children }: LegendWrapperProps) => {
  return (
    <div className="rounded-b-md bg-gray-100 p-4 text-xs drop-shadow-md">
      {title && <p className="font-semibold">{title}</p>}
      <div className="flex flex-wrap gap-2 pt-2">{children}</div>
    </div>
  )
}

type LegendItemProps = {
  children: ReactNode
  text: string
}

export const LegendItem = ({ children, text }: LegendItemProps) => {
  return (
    <div className="flex items-center gap-2">
      {children}
      <p>{text}</p>
    </div>
  )
}
