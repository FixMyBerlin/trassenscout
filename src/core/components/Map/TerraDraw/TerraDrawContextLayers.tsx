import { LineEndPointsLayer } from "@/src/core/components/Map/layers/LineEndPointsLayer"
import { LinesLayer } from "@/src/core/components/Map/layers/LinesLayer"
import { PointsLayer } from "@/src/core/components/Map/layers/PointsLayer"
import { PolygonsLayer } from "@/src/core/components/Map/layers/PolygonsLayer"
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

// Encapsulates all context rendering for TerraDrawMap
// Keeps computation and layer rendering inline (no unnecessary abstraction)
export const TerraDrawContextLayers = ({
  subsections,
  selectedSubsectionSlug,
  subsubsections,
  selectedSubsubsectionSlug,
}: Props) => {
  const isSubsubsectionContext = Boolean(subsections && selectedSubsectionSlug && subsubsections)

  // 1. Compute subsection features
  const subsectionFeatures = useMemo(() => {
    if (!subsections || !selectedSubsectionSlug) return null

    return getSubsectionFeatures({
      subsections,
      highlight: "currentSubsection",
      selectedSubsectionSlug,
    })
  }, [subsections, selectedSubsectionSlug])

  // 2. For subsection edit: filter to only other subsections (isCurrent === false)
  const subsectionEditFeatures = useMemo(() => {
    if (!subsectionFeatures || isSubsubsectionContext) return null

    const filteredLines = {
      ...subsectionFeatures.lines,
      features: subsectionFeatures.lines.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPolygons = {
      ...subsectionFeatures.polygons,
      features: subsectionFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredLineEndPoints = {
      ...subsectionFeatures.lineEndPoints,
      features: subsectionFeatures.lineEndPoints.features.filter((f) => {
        // Filter endpoints based on their associated line's isCurrent status
        const lineSlug = f.properties.lineId
        const lineFeature = subsectionFeatures.lines.features.find(
          (lf) => lf.properties.subsectionSlug === lineSlug,
        )
        return lineFeature && !lineFeature.properties.isCurrent
      }),
    }

    return {
      lines: filteredLines,
      polygons: filteredPolygons,
      lineEndPoints: filteredLineEndPoints,
    }
  }, [subsectionFeatures, isSubsubsectionContext])

  // 3. For subsubsection edit: compute other subsubsection features (isCurrent === false)
  const otherSubsubsectionFeatures = useMemo(() => {
    if (!subsubsections) return null

    const allFeatures = getSubsubsectionFeatures({
      subsubsections,
      selectedSubsubsectionSlug: selectedSubsubsectionSlug ?? null,
    })

    // Filter to only features where isCurrent === false
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

  // Subsection edit mode: show other subsections as actual lines/polygons (not hulls)
  if (subsectionEditFeatures) {
    return (
      <>
        {subsectionEditFeatures.lines && subsectionEditFeatures.lines.features.length > 0 && (
          <LinesLayer
            lines={subsectionEditFeatures.lines}
            layerIdSuffix="_terra_draw_other_subsection"
            interactive={false}
            colorSchema="subsection"
          />
        )}
        {subsectionEditFeatures.polygons && subsectionEditFeatures.polygons.features.length > 0 && (
          <PolygonsLayer
            polygons={subsectionEditFeatures.polygons}
            layerIdSuffix="_terra_draw_other_subsection"
            interactive={false}
            colorSchema="subsection"
          />
        )}
        {subsectionEditFeatures.lineEndPoints &&
          subsectionEditFeatures.lineEndPoints.features.length > 0 && (
            <LineEndPointsLayer
              lineEndPoints={subsectionEditFeatures.lineEndPoints}
              layerIdSuffix="_terra_draw_other_subsection"
              colorSchema="subsection"
            />
          )}
      </>
    )
  }

  // Subsubsection edit mode: show subsection layers + other subsubsections
  if (isSubsubsectionContext && subsectionFeatures) {
    return (
      <>
        {/* Subsection features as non-interactive background */}
        {subsectionFeatures.lines && subsectionFeatures.lines.features.length > 0 && (
          <LinesLayer
            lines={subsectionFeatures.lines}
            layerIdSuffix="_terra_draw_subsection"
            interactive={false}
            colorSchema="subsection"
          />
        )}
        {subsectionFeatures.polygons && subsectionFeatures.polygons.features.length > 0 && (
          <PolygonsLayer
            polygons={subsectionFeatures.polygons}
            layerIdSuffix="_terra_draw_subsection"
            interactive={false}
            colorSchema="subsection"
          />
        )}
        {subsectionFeatures.lineEndPoints &&
          subsectionFeatures.lineEndPoints.features.length > 0 && (
            <LineEndPointsLayer
              lineEndPoints={subsectionFeatures.lineEndPoints}
              layerIdSuffix="_terra_draw_subsection"
              colorSchema="subsection"
            />
          )}

        {/* Other subsubsections as non-interactive layers */}
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
    )
  }

  return null
}
