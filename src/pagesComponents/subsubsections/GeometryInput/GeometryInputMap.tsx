import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { layerColors } from "@/src/core/components/Map/layerColors"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "@/src/core/components/Map/utils/pointToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection, lineString, point } from "@turf/helpers"
import { bbox, cleanCoords, distance, lineSlice, nearestPointOnLine } from "@turf/turf"
import type { Feature, Geometry, Point } from "geojson"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Layer, LngLatBoundsLike, MapLayerMouseEvent, Source } from "react-map-gl/maplibre"
import { GeometryInputMapSubsubsections } from "./GeometryInputMapSubsubsections"

type Props = {
  subsection: SubsectionWithPosition
}

export const GeometryInputMap = ({ subsection }: Props) => {
  const { watch, setValue } = useFormContext()
  // const { preview } = useMap()
  const geometry = watch("geometry") as Geometry
  const geometryType = watch("type") as SubsubsectionWithPosition["type"]

  const subsectionFeature = featureCollection([
    lineString(subsection.geometry.coordinates, { color: layerColors.unselectableCurrent }),
  ])

  const [minX, minY, maxX, maxY] = bbox(lineString(subsection.geometry.coordinates))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const [pointOneOnLine, setPointOneOnLine] = useState<Feature<Point> | undefined>(undefined)
  const [pointTwoOnLine, setPointTwoOnLine] = useState<Feature<Point> | undefined>(undefined)

  const handleClickGeometryTypePoint = (event: MapLayerMouseEvent) => {
    const clickedPoint = point(event.lngLat.toArray())

    // nearestPointOnLine() requires a LineString without duplicate coordinates - this is a bug reported here: https://github.com/Turfjs/turf/issues/2808#event-3187358882
    // when the fix is released we can remove cleanCoords()
    const cleanedSubsection = cleanCoords(lineString(subsection.geometry.coordinates))
    const nearestPoint = nearestPointOnLine(cleanedSubsection, clickedPoint)

    // Set geometry as GeoJSON Point object
    setValue("geometry", {
      type: "Point",
      coordinates: nearestPoint.geometry.coordinates,
    })
  }

  const handleClickGeometryTypeLine = (event: MapLayerMouseEvent) => {
    // const allSources = preview?.getStyle()?.sources
    // const allLayers = preview?.getStyle()?.layers
    // const cleanLayers = allLayers?.filter(
    //   (layer) =>
    //     "source" in layer &&
    //     !layer.source.includes("maptiler") &&
    //     !layer.source.includes("openmaptiles"),
    // )
    // console.log({ allSources, allLayers, cleanLayers })
    const clickedPoint = point(event.lngLat.toArray())

    // nearestPointOnLine() requires a LineString without duplicate coordinates - this is a bug reported here: https://github.com/Turfjs/turf/issues/2808#event-3187358882
    // when the fix is released we can remove cleanCoords()
    const cleanedSubsection = cleanCoords(lineString(subsection.geometry.coordinates))
    const nearestPoint = nearestPointOnLine(cleanedSubsection, clickedPoint)
    let newLine = undefined

    // First set point one and point two
    if (!pointOneOnLine) {
      setPointOneOnLine(nearestPoint)
      return
    }

    if (!pointTwoOnLine) {
      setPointTwoOnLine(nearestPoint)
      newLine = lineSlice(pointOneOnLine, nearestPoint, cleanedSubsection)
      setValue("geometry", {
        type: "LineString",
        coordinates: newLine.geometry.coordinates,
      })
      return
    }

    // Now, every next click should update the nearest point
    const distanceNewPointToPointOne = distance(clickedPoint, pointOneOnLine)
    const distanceNewPointToPointTwo = distance(clickedPoint, pointTwoOnLine)

    if (distanceNewPointToPointOne < distanceNewPointToPointTwo) {
      setPointOneOnLine(nearestPoint)
      newLine = lineSlice(nearestPoint, pointTwoOnLine, cleanedSubsection)
    } else {
      setPointTwoOnLine(nearestPoint)
      newLine = lineSlice(pointOneOnLine, nearestPoint, cleanedSubsection)
    }
    if (newLine) {
      setValue("geometry", {
        type: "LineString",
        coordinates: newLine.geometry.coordinates,
      })
    }
  }

  const handleClickGeometryTypePolygon = (event: MapLayerMouseEvent) => {
    // TODO: Implement polygon drawing with maplibre-gl-terradraw
    // For now, this is a placeholder - polygon drawing will be implemented with terradraw
    console.log("Polygon drawing not yet implemented - will use terradraw")
  }

  return (
    <div
      aria-describedby="geometry-input-help"
      className="rounded-sm border border-gray-200 bg-gray-100 p-3 text-gray-700"
    >
      <h3 className="m-0 mb-3 flex items-center gap-1 text-sm font-medium">
        {geometryType === "LINE"
          ? "Liniengeometrie"
          : geometryType === "POINT"
            ? "Punktgeometrie"
            : "Geometrie"}{" "}
        zeichnen
      </h3>
      <div className="mb-3 h-[500px] w-full overflow-clip rounded-md drop-shadow-md">
        <BaseMap
          initialViewState={{
            bounds: sectionBounds,
            fitBoundsOptions: { padding: 100 },
          }}
          id="preview-input"
          dots={[]}
          lines={subsectionFeature}
          onClick={
            geometryType === "LINE"
              ? handleClickGeometryTypeLine
              : geometryType === "POINT"
                ? handleClickGeometryTypePoint
                : // POLYGON type is read-only - editing only via text input
                  undefined
          }
        >
          <GeometryInputMapSubsubsections />

          {geometryType === "LINE" && geometry && (
            <>
              {/* nearest Points to where clicked */}
              <Source
                id="nearestPoint-line"
                key="nearestPoint-line"
                type="geojson"
                data={featureCollection([pointOneOnLine, pointTwoOnLine].filter(Boolean))}
              />
              <Layer
                id="nearestPoint-line-layer"
                key="nearestPoint-line-layer"
                source="nearestPoint-line"
                type="circle"
                paint={{
                  "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 14],
                  "circle-color": ["case", ["has", "color"], ["get", "color"], "#E5007D"],
                  "circle-opacity": 0.5,
                }}
              />

              {/* Geometry from form */}
              {(geometry.type === "LineString" || geometry.type === "MultiLineString") &&
                lineStringToGeoJSON(geometry) && (
                  <>
                    <Source
                      id="geometry-line"
                      key="geometry-line"
                      type="geojson"
                      data={featureCollection(lineStringToGeoJSON(geometry)!)}
                    />
                    <Layer
                      id="geometry-line-layer"
                      key="geometry-line-layer"
                      source="geometry-line"
                      type="line"
                      paint={{
                        "line-width": 4,
                        "line-color": "black",
                        "line-opacity": 0.6,
                      }}
                    />
                  </>
                )}
            </>
          )}

          {geometryType === "POINT" &&
            geometry &&
            geometry.type === "Point" &&
            pointToGeoJSON(geometry) && (
              <>
                <Source
                  id="geometry-point"
                  key="geometry-point"
                  type="geojson"
                  data={pointToGeoJSON(geometry)!}
                />
                <Layer
                  id="geometry-point-layer"
                  key="geometry-point-layer"
                  source="geometry-point"
                  type="circle"
                  paint={{
                    "circle-radius": 4,
                    "circle-color": "black",
                    "circle-opacity": 0.6,
                    "circle-stroke-width": 12,
                    "circle-stroke-color": "#E5007D",
                    "circle-stroke-opacity": 0.5,
                  }}
                />
              </>
            )}

          {geometryType === "POLYGON" &&
            geometry &&
            (geometry.type === "Polygon" || geometry.type === "MultiPolygon") &&
            polygonToGeoJSON(geometry) && (
              <>
                <Source
                  id="geometry-polygon"
                  key="geometry-polygon"
                  type="geojson"
                  data={featureCollection(polygonToGeoJSON(geometry)!)}
                />
                <Layer
                  id="geometry-polygon-fill"
                  key="geometry-polygon-fill"
                  source="geometry-polygon"
                  type="fill"
                  paint={{
                    "fill-color": "black",
                    "fill-opacity": 0.3,
                  }}
                />
                <Layer
                  id="geometry-polygon-outline"
                  key="geometry-polygon-outline"
                  source="geometry-polygon"
                  type="line"
                  paint={{
                    "line-width": 3,
                    "line-color": "black",
                    "line-opacity": 0.8,
                  }}
                />
              </>
            )}
        </BaseMap>
      </div>
    </div>
  )
}
