import { LegendIcon } from "@/src/core/components/Map/Icons/LegendIcon"
import { GeometryTypeEnum } from "@prisma/client"
import { ReactNode } from "react"

export type LegendItemConfig =
  | {
      shape: GeometryTypeEnum.LINE
      text: string
      color: string
      dots?: boolean
      isDashed?: boolean
      secondColor?: string
    }
  | {
      shape: GeometryTypeEnum.POINT
      text: string
      color: string
    }
  | {
      shape: GeometryTypeEnum.POLYGON
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
        switch (item.shape) {
          case GeometryTypeEnum.LINE:
            return (
              <LegendItem text={item.text} key={item.text}>
                <LegendIcon
                  type={item.shape}
                  isDashed={item.isDashed}
                  color={item.color}
                  secondColor={item.secondColor}
                  showDots={item.dots}
                />
              </LegendItem>
            )

          case GeometryTypeEnum.POINT:
            return (
              <LegendItem text={item.text} key={item.text}>
                <LegendIcon type={item.shape} color={item.color} />
              </LegendItem>
            )

          case GeometryTypeEnum.POLYGON:
            return (
              <LegendItem text={item.text} key={item.text}>
                <LegendIcon type={item.shape} color={item.color} />
              </LegendItem>
            )
        }
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
