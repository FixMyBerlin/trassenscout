import { layerColors } from "@/src/core/components/Map/layerColors"
import { ReactNode } from "react"

const LegendDots = () => (
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
)

export type LegendItemConfig =
  | {
      shape: "line"
      text: string
      color: string
      dots?: boolean
    }
  | {
      shape: "dashedLine"
      text: string
      color: string
      dots?: boolean
      secondColor: string
    }
  | {
      shape: "circle"
      text: string
      color: string
    }
  | {
      shape: "polygon"
      text: string
      color: string
    }

type LegendProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapLegend = ({ legendItemsConfig }: LegendProps) => {
  if (!legendItemsConfig) return
  return (
    <LegendWrapper title="Kartenlegende">
      {legendItemsConfig.map((item) => {
        if (item.shape === "line") {
          return (
            <LegendItem text={item.text} key={item.text}>
              <span className="relative h-2.5 w-8">
                {item.dots && <LegendDots />}
                <span
                  className="absolute top-px h-2 w-8 rounded-sm border border-gray-500 bg-blue-500"
                  style={{ backgroundColor: item.color }}
                />
              </span>
            </LegendItem>
          )
        }

        if (item.shape === "dashedLine") {
          return (
            <LegendItem text={item.text} key={item.text}>
              <span className="relative h-2.5 w-8">
                {item.dots && <LegendDots />}
                {/* Background line for dashed pattern */}
                <span
                  className="absolute top-px h-2 w-8 rounded"
                  style={{ backgroundColor: item.color }}
                />
                {/* Dashed line segments */}
                <span
                  className="absolute top-px h-2 w-1 rounded-l"
                  style={{ backgroundColor: item.secondColor }}
                />
                <span
                  className="absolute top-px left-2.5 h-2 w-1"
                  style={{ backgroundColor: item.secondColor }}
                />
                <span
                  className="absolute top-px left-5 h-2 w-1"
                  style={{ backgroundColor: item.secondColor }}
                />
              </span>
            </LegendItem>
          )
        }

        if (item.shape === "circle") {
          return (
            <LegendItem text={item.text} key={item.text}>
              <span className="relative size-[18px] shrink-0">
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
        }

        if (item.shape === "polygon") {
          return (
            <LegendItem text={item.text} key={item.text}>
              <span className="relative size-[18px] shrink-0">
                <span
                  className="absolute inline-block size-[18px] rounded border-2"
                  style={{ borderColor: item.color, backgroundColor: `${item.color}30` }}
                />
              </span>
            </LegendItem>
          )
        }
        return null
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
