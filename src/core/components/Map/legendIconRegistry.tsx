import { acquisitionAreaColors } from "@/src/core/components/Map/colors/acquisitionAreaColors"
import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import {
  GeometryTypeEnum,
  SubsectionStatusStyleEnum,
  SubsubsectionStatusStyleEnum,
} from "@prisma/client"

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
  subsubsectionLineGreen: {
    type: GeometryTypeEnum.LINE,
    color: subsubsectionColors.line.green,
    lineWidth: subsubsectionColors.line.width,
  },
  subsubsectionPointGreen: {
    type: GeometryTypeEnum.POINT,
    color: subsubsectionColors.point.green,
  },
  subsubsectionPolygonGreen: {
    type: GeometryTypeEnum.POLYGON,
    color: subsubsectionColors.polygon.green,
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionParcelPolygon: {
    type: GeometryTypeEnum.POLYGON,
    color: subsectionColors.hull.current,
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionParcelPolygonEdit: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.parcel,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  acquisitionAreaPolygon: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.negotiationArea,
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionAreaPolygonStatus1: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.statusByStyle[1],
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionAreaPolygonStatus2: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.statusByStyle[2],
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionAreaPolygonStatus3: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.statusByStyle[3],
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionAreaPolygonStatus4: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.statusByStyle[4],
    borderWidth: 2,
    borderStyle: "solid",
  },
  acquisitionAreaPolygonEdit: {
    type: GeometryTypeEnum.POLYGON,
    color: acquisitionAreaColors.negotiationAreaEdit,
    borderWidth: 2,
    borderStyle: "solid",
  },
} as const satisfies Record<string, LegendIconProps>

export type LegendIconId = keyof typeof legendIconRegistry

export function getIconIdForSubsection(
  type: GeometryTypeEnum,
  statusStyle?: SubsectionStatusStyleEnum | null,
) {
  switch (type) {
    case GeometryTypeEnum.LINE: {
      switch (statusStyle) {
        case SubsectionStatusStyleEnum.DASHED:
          return "subsectionLineDashed"
        case SubsectionStatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsectionLineDefault"
      }
    }
    case GeometryTypeEnum.POLYGON: {
      switch (statusStyle) {
        case SubsectionStatusStyleEnum.DASHED:
          return "subsectionPolygonDashed"
        case SubsectionStatusStyleEnum.REGULAR:
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
  statusStyle: SubsubsectionStatusStyleEnum | null,
) {
  switch (type) {
    case GeometryTypeEnum.LINE: {
      switch (statusStyle) {
        case SubsubsectionStatusStyleEnum.GREEN:
          return "subsubsectionLineGreen"
        case SubsubsectionStatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsubsectionLine"
      }
    }
    case GeometryTypeEnum.POINT: {
      switch (statusStyle) {
        case SubsubsectionStatusStyleEnum.GREEN:
          return "subsubsectionPointGreen"
        case SubsubsectionStatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsubsectionPoint"
      }
    }
    case GeometryTypeEnum.POLYGON: {
      switch (statusStyle) {
        case SubsubsectionStatusStyleEnum.GREEN:
          return "subsubsectionPolygonGreen"
        case SubsubsectionStatusStyleEnum.REGULAR:
        case null:
        case undefined:
          return "subsubsectionPolygon"
      }
    }
  }
}
