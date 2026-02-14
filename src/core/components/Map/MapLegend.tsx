import { LegendIcon } from "@/src/core/components/Map/Icons/LegendIcon"
import { GeometryTypeEnum } from "@prisma/client"
import { ReactNode } from "react"

export type LegendItemConfig =
  | {
      shape: typeof GeometryTypeEnum.LINE
      text: string
      color: string
      dots?: boolean
      dotsColor?: string
      lineWidth?: number
      isDashed?: boolean
      secondColor?: string
    }
  | {
      shape: typeof GeometryTypeEnum.POINT
      text: string
      color: string
    }
  | {
      shape: typeof GeometryTypeEnum.POLYGON
      text: string
      color: string
      borderWidth?: number
      borderStyle?: "solid" | "dashed"
    }
  | {
      shapes: [typeof GeometryTypeEnum.LINE, typeof GeometryTypeEnum.POLYGON]
      text: string
      color: string
      dots?: boolean
      dotsColor?: string
      lineWidth?: number
      borderWidth?: number
      borderStyle?: "solid" | "dashed"
      isHull?: boolean
    }
  | {
      shapes: [
        typeof GeometryTypeEnum.LINE,
        typeof GeometryTypeEnum.POINT,
        typeof GeometryTypeEnum.POLYGON,
      ]
      text: string
      color: string
      dots?: boolean
      dotsColor?: string
      lineWidth?: number
      borderWidth?: number
      borderStyle?: "solid" | "dashed"
      isDashed?: boolean
      secondColor?: string
    }

type LegendProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapLegend = ({ legendItemsConfig }: LegendProps) => {
  if (!legendItemsConfig) return
  return (
    <LegendWrapper>
      {legendItemsConfig.map((item) => {
        if ("shapes" in item) {
          // Multiple shapes
          if (item.shapes.length === 3) {
            // LINE + POINT + POLYGON
            const threeShapesItem = item as Extract<
              LegendItemConfig,
              {
                shapes: [
                  typeof GeometryTypeEnum.LINE,
                  typeof GeometryTypeEnum.POINT,
                  typeof GeometryTypeEnum.POLYGON,
                ]
              }
            >
            return (
              <LegendItem text={item.text} key={item.text}>
                <>
                  <LegendIcon
                    type={GeometryTypeEnum.LINE}
                    color={item.color}
                    showDots={threeShapesItem.dots}
                    dotsColor={threeShapesItem.dotsColor}
                    lineWidth={threeShapesItem.lineWidth}
                    isDashed={threeShapesItem.isDashed}
                    secondColor={threeShapesItem.secondColor}
                  />
                  <LegendIcon type={GeometryTypeEnum.POINT} color={item.color} />
                  <LegendIcon
                    type={GeometryTypeEnum.POLYGON}
                    color={item.color}
                    borderWidth={threeShapesItem.borderWidth}
                    borderStyle={threeShapesItem.borderStyle}
                  />
                </>
              </LegendItem>
            )
          }
          // LINE + POLYGON
          const twoShapesItem = item as Extract<
            LegendItemConfig,
            { shapes: [typeof GeometryTypeEnum.LINE, typeof GeometryTypeEnum.POLYGON] }
          >
          if (twoShapesItem.isHull) {
            return (
              <LegendItem text={item.text} key={item.text}>
                <LegendIcon
                  type={GeometryTypeEnum.POLYGON}
                  color={item.color}
                  borderWidth={twoShapesItem.borderWidth}
                  borderStyle={twoShapesItem.borderStyle}
                />
              </LegendItem>
            )
          }
          return (
            <LegendItem text={item.text} key={item.text}>
              <>
                <LegendIcon
                  type={GeometryTypeEnum.LINE}
                  color={item.color}
                  showDots={twoShapesItem.dots}
                  dotsColor={twoShapesItem.dotsColor}
                  lineWidth={twoShapesItem.lineWidth}
                />
                <LegendIcon
                  type={GeometryTypeEnum.POLYGON}
                  color={item.color}
                  borderWidth={twoShapesItem.borderWidth}
                  borderStyle={twoShapesItem.borderStyle}
                />
              </>
            </LegendItem>
          )
        }

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
                  dotsColor={item.dotsColor}
                  lineWidth={item.lineWidth}
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
                <LegendIcon
                  type={item.shape}
                  color={item.color}
                  borderWidth={item.borderWidth}
                  borderStyle={item.borderStyle}
                />
              </LegendItem>
            )
        }
      })}
    </LegendWrapper>
  )
}

type LegendWrapperProps = {
  children: ReactNode[]
}

export const LegendWrapper = ({ children }: LegendWrapperProps) => {
  return (
    <div className="rounded-b-md bg-gray-100 px-3 py-2 text-xs drop-shadow-md">
      <div className="flex flex-wrap gap-x-6 gap-y-2">{children}</div>
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
