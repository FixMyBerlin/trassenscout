import { LineEndPointsLayer } from "@/src/core/components/Map/layers/LineEndPointsLayer"
import { LinesLayer } from "@/src/core/components/Map/layers/LinesLayer"
import { PointsLayer } from "@/src/core/components/Map/layers/PointsLayer"
import { PolygonsLayer } from "@/src/core/components/Map/layers/PolygonsLayer"
import { SubsectionHullsLayer } from "@/src/core/components/Map/layers/SubsectionHullsLayer"
import { getSubsectionFeatures } from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { useMemo } from "react"

type Props = {
  subsections?: TSubsections
  selectedSubsectionSlug?: string
  subsubsections?: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug?: string
}

// Encapsulates all context rendering for TerraDrawMap.
// Subsection hulls aligned with presentational maps: same getSubsectionFeatures (all subsections, isCurrent set).
export const TerraDrawContextLayers = ({
  subsections,
  selectedSubsectionSlug,
  subsubsections,
  selectedSubsubsectionSlug,
}: Props) => {
  const isSubsubsectionContext = Boolean(subsections && selectedSubsectionSlug && subsubsections)

  // 1. Subsection features: same as SubsectionSubsubsectionMap (all subsections, isCurrent for selected)
  const subsectionFeatures = useMemo(() => {
    if (!subsections || !selectedSubsectionSlug) return null
    return getSubsectionFeatures({
      subsections,
      highlight: "currentSubsection",
      selectedSubsectionSlug,
    })
  }, [subsections, selectedSubsectionSlug])

  // 2. Subsection hull input for SubsectionHullsLayer (same two-color behavior as presentational map).
  // Presentational: subsection map and subsubsection map both show all subsections as hulls in two colors (current vs other).
  // - Subsection edit: we want the same (current one color, others the other). Current is drawn by TerraDraw, so we pass
  //   only "other" subsections to the hull layer; they all get the "other" color. No double-draw of current.
  // - Subsubsection edit: same as presentational – pass all subsections; hull layer styles by isCurrent (two colors).
  const subsectionHullFeatures = useMemo(() => {
    if (!subsectionFeatures) return null
    if (isSubsubsectionContext) {
      return { lines: subsectionFeatures.lines, polygons: subsectionFeatures.polygons }
    }
    return {
      lines: {
        ...subsectionFeatures.lines,
        features: subsectionFeatures.lines.features.filter((f) => !f.properties.isCurrent),
      },
      polygons: {
        ...subsectionFeatures.polygons,
        features: subsectionFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
      },
    }
  }, [subsectionFeatures, isSubsubsectionContext])

  // 3. Other subsubsection features (subsubsection edit only): same idea as presentational map – "other" entries
  const otherSubsubsectionFeatures = useMemo(() => {
    if (!subsubsections) return null
    const allFeatures = getSubsubsectionFeatures({
      subsubsections,
      selectedSubsubsectionSlug: selectedSubsubsectionSlug ?? null,
    })
    const filteredLines = {
      ...allFeatures.lines,
      features: allFeatures.lines.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPolygons = {
      ...allFeatures.polygons,
      features: allFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPoints = {
      ...allFeatures.points,
      features: allFeatures.points.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredLineEndPoints = {
      ...allFeatures.lineEndPoints,
      features: allFeatures.lineEndPoints.features.filter((f) => {
        const lineSlug = f.properties.lineId
        const lineFeature = allFeatures.lines.features.find(
          (lf) => lf.properties.subsubsectionSlug === lineSlug,
        )
        return lineFeature && !lineFeature.properties.isCurrent
      }),
    }
    return {
      lines: filteredLines.features.length > 0 ? filteredLines : undefined,
      polygons: filteredPolygons.features.length > 0 ? filteredPolygons : undefined,
      points: filteredPoints.features.length > 0 ? filteredPoints : undefined,
      lineEndPoints: filteredLineEndPoints.features.length > 0 ? filteredLineEndPoints : undefined,
    }
  }, [subsubsections, selectedSubsubsectionSlug])

  if (!subsectionHullFeatures) return null

  return (
    <>
      <SubsectionHullsLayer
        lines={subsectionHullFeatures.lines}
        polygons={subsectionHullFeatures.polygons}
        layerIdSuffix="_terra_draw_subsection"
      />
      {isSubsubsectionContext && (
        <>
          {otherSubsubsectionFeatures?.lines && (
            <LinesLayer
              lines={otherSubsubsectionFeatures.lines}
              layerIdSuffix="_terra_draw_other_subsubsection"
              interactive={false}
              colorSchema="subsubsection"
            />
          )}
          {otherSubsubsectionFeatures?.polygons && (
            <PolygonsLayer
              polygons={otherSubsubsectionFeatures.polygons}
              layerIdSuffix="_terra_draw_other_subsubsection"
              interactive={false}
              colorSchema="subsubsection"
            />
          )}
          {otherSubsubsectionFeatures?.points && (
            <PointsLayer
              points={otherSubsubsectionFeatures.points}
              layerIdSuffix="_terra_draw_other_subsubsection"
              interactive={false}
              colorSchema="subsubsection"
            />
          )}
          {otherSubsubsectionFeatures?.lineEndPoints && (
            <LineEndPointsLayer
              lineEndPoints={otherSubsubsectionFeatures.lineEndPoints}
              layerIdSuffix="_terra_draw_other_subsubsection"
              colorSchema="subsubsection"
            />
          )}
        </>
      )}
    </>
  )
}
