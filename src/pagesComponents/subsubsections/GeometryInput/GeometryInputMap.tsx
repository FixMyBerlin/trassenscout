import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { layerColors } from "@/src/core/components/Map/layerColors"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection, lineString, point } from "@turf/helpers"
import { bbox, distance, lineSlice, nearestPointOnLine } from "@turf/turf"
import type { Feature, Point, Position } from "geojson"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Layer, LngLatBoundsLike, MapLayerMouseEvent, Source } from "react-map-gl/maplibre"
import { GeometryInputMapSubsubsections } from "./GeometryInputMapSubsubsections"

type Props = {
  subsection: SubsectionWithPosition
}

type RouteGeometry = Position[] // [number, number][]
type AreaGeometry = Position // [number, number]

export const GeometryInputMap = ({ subsection }: Props) => {
  const { watch, setValue } = useFormContext()
  const geometry = watch("geometry") as RouteGeometry | AreaGeometry
  const geometryType = watch("type") as SubsubsectionWithPosition["type"]

  const subsectionFeature = featureCollection([
    lineString(subsection.geometry, { color: layerColors.unselectableCurrent }),
  ])

  const [minX, minY, maxX, maxY] = bbox(lineString(subsection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const [pointOneOnLine, setPointOneOnLine] = useState<Feature<Point> | undefined>(undefined)
  const [pointTwoOnLine, setPointTwoOnLine] = useState<Feature<Point> | undefined>(undefined)

  const handleClickGeometryTypeArea = (event: MapLayerMouseEvent) => {
    const clickedPoint = point(event.lngLat.toArray())
    const nearestPoint = nearestPointOnLine(lineString(subsection.geometry), clickedPoint)

    setValue("geometry", nearestPoint.geometry.coordinates)
  }

  const handleClickGeometryTypeRoute = (event: MapLayerMouseEvent) => {
    const clickedPoint = point(event.lngLat.toArray())
    const nearestPoint = nearestPointOnLine(lineString(subsection.geometry), clickedPoint)
    let newLine = undefined

    // First set point one and point two
    if (!pointOneOnLine) {
      setPointOneOnLine(nearestPoint)
      return
    }

    if (!pointTwoOnLine) {
      setPointTwoOnLine(nearestPoint)
      newLine = lineSlice(pointOneOnLine, nearestPoint, lineString(subsection.geometry))
      setValue("geometry", newLine.geometry.coordinates)
      return
    }

    // Now, every next click should update the nearest point
    const distanceNewPointToPointOne = distance(clickedPoint, pointOneOnLine)
    const distanceNewPointToPointTwo = distance(clickedPoint, pointTwoOnLine)

    if (distanceNewPointToPointOne < distanceNewPointToPointTwo) {
      setPointOneOnLine(nearestPoint)
      newLine = lineSlice(nearestPoint, pointTwoOnLine, lineString(subsection.geometry))
    } else {
      setPointTwoOnLine(nearestPoint)
      newLine = lineSlice(pointOneOnLine, nearestPoint, lineString(subsection.geometry))
    }
    newLine && setValue("geometry", newLine.geometry.coordinates)
  }

  return (
    <div className="rounded border bg-gray-100 p-3 text-gray-700">
      <h3 className="m-0 mb-3 flex items-center gap-1 text-sm font-medium">
        {geometryType === "ROUTE" ? "Liniengeometrie" : "Punktgeometrie"} zeichnen
      </h3>
      <div className="mb-3 h-[500px] w-full overflow-clip rounded-md drop-shadow-md">
        <BaseMap
          initialViewState={{
            bounds: sectionBounds,
            fitBoundsOptions: { padding: 100 },
          }}
          id="preview"
          dots={[]}
          lines={subsectionFeature}
          onClick={
            geometryType === "ROUTE" ? handleClickGeometryTypeRoute : handleClickGeometryTypeArea
          }
        >
          <GeometryInputMapSubsubsections />
          {geometryType === "ROUTE" ? (
            <>
              {/* nearest Points to where clicked */}
              <Source
                key="nearestPoint"
                type="geojson"
                data={featureCollection([pointOneOnLine, pointTwoOnLine].filter(Boolean))}
              >
                <Layer
                  id="nearestPoint"
                  type="circle"
                  paint={{
                    "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 14],
                    "circle-color": ["case", ["has", "color"], ["get", "color"], "#E5007D"],
                    "circle-opacity": 0.5,
                  }}
                />
              </Source>

              {/* Geometry from form */}
              <Source key="geometry" type="geojson" data={lineString(geometry as RouteGeometry)}>
                <Layer
                  type="line"
                  paint={{
                    "line-width": 4,
                    "line-color": "black",
                    "line-opacity": 0.6,
                  }}
                />
              </Source>
            </>
          ) : (
            <Source type="geojson" data={point(geometry as AreaGeometry)}>
              <Layer
                id="nearestPoint"
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
            </Source>
          )}
        </BaseMap>
      </div>
    </div>
  )
}
