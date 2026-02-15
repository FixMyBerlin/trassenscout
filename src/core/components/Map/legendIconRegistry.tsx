import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { GeometryTypeEnum, StatusStyleEnum } from "@prisma/client"

type LegendIconProps = {
  type: GeometryTypeEnum
  isDashed?: boolean
  color: string
  secondColor?: string
  lineWidth?: number
  borderWidth?: number
  borderStyle?: "solid" | "dashed"
}

/**
 * Registry of all legend icon definitions by stable id.
 * Each entry is a single shape+style combination with props ready for LegendIcon.
 */
export const legendIconRegistry = {
  subsectionLineDefault: {
    type: GeometryTypeEnum.LINE,
    color: subsectionColors.hull.current,
    lineWidth: subsectionColors.line.width,
  },
  subsectionPolygonDefault: {
    type: GeometryTypeEnum.POLYGON,
    color: subsectionColors.hull.current,
    borderWidth: 2,
    borderStyle: "solid",
  },
  subsectionLineDashed: {
    type: GeometryTypeEnum.LINE,
    color: subsectionColors.hull.current,
    isDashed: true,
    secondColor: subsectionColors.line.dashedSecondary,
    lineWidth: subsectionColors.line.width,
  },
  subsectionPolygonDashed: {
    type: GeometryTypeEnum.POLYGON,
    color: subsectionColors.hull.current,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  subsectionHullPolygonCurrent: {
    type: GeometryTypeEnum.POLYGON,
    color: subsectionColors.hull.current,
    borderWidth: 1,
    borderStyle: "solid",
  },
  subsectionHullPolygonUnselected: {
    type: GeometryTypeEnum.POLYGON,
    color: subsectionColors.hull.unselected,
    borderWidth: 1,
    borderStyle: "solid",
  },
  subsubsectionLine: {
    type: GeometryTypeEnum.LINE,
    color: subsubsectionColors.line.current,
    lineWidth: subsubsectionColors.line.width,
  },
  subsubsectionPoint: {
    type: GeometryTypeEnum.POINT,
    color: subsubsectionColors.line.current,
  },
  subsubsectionPolygon: {
    type: GeometryTypeEnum.POLYGON,
    color: subsubsectionColors.line.current,
    borderWidth: 2,
    borderStyle: "solid",
  },
  subsubsectionLineDashed: {
    type: GeometryTypeEnum.LINE,
    color: subsubsectionColors.line.unselected,
    isDashed: true,
    secondColor: subsubsectionColors.line.dashedSecondary,
    lineWidth: subsubsectionColors.line.width,
  },
  subsubsectionPointDashed: {
    type: GeometryTypeEnum.POINT,
    color: subsubsectionColors.line.unselected,
    borderStyle: "dashed",
  },
  subsubsectionPolygonDashed: {
    type: GeometryTypeEnum.POLYGON,
    color: subsubsectionColors.line.unselected,
    borderWidth: 2,
    borderStyle: "dashed",
  },
} as const satisfies Record<string, LegendIconProps>

export type LegendIconId = keyof typeof legendIconRegistry

export function getIconIdForSubsection(
  type: GeometryTypeEnum,
  statusStyle?: StatusStyleEnum | null,
) {
  switch (type) {
    case GeometryTypeEnum.LINE: {
      switch (statusStyle) {
        case StatusStyleEnum.DASHED:
          return "subsectionLineDashed"
        case StatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsectionLineDefault"
      }
    }
    case GeometryTypeEnum.POLYGON: {
      switch (statusStyle) {
        case StatusStyleEnum.DASHED:
          return "subsectionPolygonDashed"
        case StatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsectionPolygonDefault"
      }
    }
    case GeometryTypeEnum.POINT:
      // Subsections cannot be POINT, fallback to polygon default
      return "subsectionPolygonDefault"
  }
}

export function getIconIdForSubsubsection(
  type: GeometryTypeEnum,
  statusStyle: StatusStyleEnum | null,
) {
  switch (type) {
    case GeometryTypeEnum.LINE: {
      switch (statusStyle) {
        case StatusStyleEnum.DASHED:
          return "subsubsectionLineDashed"
        case StatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsubsectionLine"
      }
    }
    case GeometryTypeEnum.POINT: {
      switch (statusStyle) {
        case StatusStyleEnum.DASHED:
          return "subsubsectionPointDashed"
        case StatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsubsectionPoint"
      }
    }
    case GeometryTypeEnum.POLYGON: {
      switch (statusStyle) {
        case StatusStyleEnum.DASHED:
          return "subsubsectionPolygonDashed"
        case StatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsubsectionPolygon"
      }
    }
  }
}
