import { Link } from "@/src/core/components/links"
import { vectorStyle } from "@/src/core/components/Map/BaseMap"
import { geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "@/src/core/components/Map/utils/pointToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { validateGeometryByType } from "@/src/server/shared/utils/validateGeometryByType"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { GeometryTypeEnum } from "@prisma/client"
import { featureCollection, point } from "@turf/helpers"
import { clsx } from "clsx"
import { useFormContext } from "react-hook-form"
import Map, {
  Layer,
  LngLatBoundsLike,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre"

const GEOMETRY_TYPE_LABELS: Record<GeometryTypeEnum, string> = {
  POINT: "Punktgeometrie",
  LINE: "Liniengeometrie",
  POLYGON: "Polygon-Geometrie",
}

type Props = {
  name: string
  hasError: boolean
}

export const LabeledGeometryFieldPreview = ({ name, hasError }: Props) => {
  const { watch, getValues } = useFormContext()
  const geometry = watch(name) as SupportedGeometry | undefined
  const geometryType = (getValues("type") ?? GeometryTypeEnum.LINE) as GeometryTypeEnum

  const schemaResult = validateGeometryByType(geometryType, geometry)

  const validGeometry = schemaResult.success && geometry ? geometry : null

  const initialViewState = (() => {
    if (!validGeometry) return {}
    if (validGeometry.type === "Point") {
      return {
        latitude: validGeometry.coordinates[1],
        longitude: validGeometry.coordinates[0],
        zoom: 14,
      }
    }
    const [minX, minY, maxX, maxY] = geometryBbox(validGeometry)
    return {
      bounds: [minX, minY, maxX, maxY] as LngLatBoundsLike,
      fitBoundsOptions: { padding: 40 },
    }
  })()

  return (
    <div
      className={clsx(
        "rounded-sm border border-gray-200 p-3 text-gray-700",
        schemaResult.success ? "bg-gray-100" : "border-red-800 bg-red-100",
      )}
    >
      <h3 className="m-0 mb-3 flex items-center justify-between gap-1 text-sm font-semibold">
        <span className="flex items-center gap-1">
          Geometrieprüfung: {GEOMETRY_TYPE_LABELS[geometryType]}
          {schemaResult.success && !hasError && (
            <CheckBadgeIcon className="size-5 pb-0.5 text-green-700" />
          )}
        </span>
        {geometry && (
          <Link
            blank
            href={`http://play.placemark.io/?load=data:application/json,${encodeURIComponent(
              JSON.stringify(geometry),
            )}`}
          >
            Auf placemark.io öffnen
          </Link>
        )}
      </h3>
      {schemaResult.success ? (
        <div className="mb-3 h-[300px] w-full overflow-clip rounded-md drop-shadow-md">
          <Map
            key={validGeometry ? JSON.stringify(validGeometry) : "empty"}
            initialViewState={initialViewState}
            id="preview"
            mapStyle={vectorStyle}
            scrollZoom={false}
          >
            <NavigationControl showCompass={false} />
            <ScaleControl />

            {validGeometry &&
              (validGeometry.type === "Point" || validGeometry.type === "MultiPoint") &&
              pointToGeoJSON(validGeometry).length > 0 && (
                <>
                  <Source
                    id="geometryFieldPoint"
                    key="geometryFieldPoint"
                    type="geojson"
                    data={featureCollection(pointToGeoJSON(validGeometry))}
                  />
                  <Layer
                    id="geometryFieldPoint-layer"
                    key="geometryFieldPoint-layer"
                    source="geometryFieldPoint"
                    type="circle"
                    paint={{
                      "circle-radius": 4,
                      "circle-color": "black",
                      "circle-opacity": 0.6,
                    }}
                  />
                </>
              )}

            {validGeometry &&
              (validGeometry.type === "LineString" || validGeometry.type === "MultiLineString") &&
              lineStringToGeoJSON(validGeometry).length > 0 && (
                <>
                  <Source
                    id="geometryFieldLine"
                    key="geometryFieldLine"
                    type="geojson"
                    data={featureCollection(lineStringToGeoJSON(validGeometry))}
                  />
                  <Layer
                    id="geometryFieldLine-layer"
                    key="geometryFieldLine-layer"
                    source="geometryFieldLine"
                    type="line"
                    paint={{
                      "line-width": 4,
                      "line-color": "black",
                      "line-opacity": 0.6,
                    }}
                  />

                  {/* Highlight the start of a Geometry so help understand the direction */}
                  {validGeometry.type === "LineString" && validGeometry.coordinates[0] && (
                    <>
                      <Source
                        id="geometryFieldLinePoint"
                        key="geometryFieldLinePoint"
                        type="geojson"
                        data={point(validGeometry.coordinates[0])}
                      />
                      <Layer
                        id="geometryFieldLinePoint-layer"
                        key="geometryFieldLinePoint-layer"
                        source="geometryFieldLinePoint"
                        type="circle"
                        paint={{
                          "circle-radius": 6,
                          "circle-color": "black",
                        }}
                      />
                    </>
                  )}
                  {/* For MultiLineString, highlight start of each line */}
                  {validGeometry.type === "MultiLineString" &&
                    validGeometry.coordinates.map((coords, index) => {
                      if (!coords[0]) return null
                      return (
                        <Source
                          key={`geometryFieldLinePoint-${index}`}
                          id={`geometryFieldLinePoint-${index}`}
                          type="geojson"
                          data={point(coords[0])}
                        />
                      )
                    })}
                  {validGeometry.type === "MultiLineString" &&
                    validGeometry.coordinates.map((_, index) => (
                      <Layer
                        key={`geometryFieldLinePoint-${index}-layer`}
                        id={`geometryFieldLinePoint-${index}-layer`}
                        source={`geometryFieldLinePoint-${index}`}
                        type="circle"
                        paint={{
                          "circle-radius": 6,
                          "circle-color": "black",
                        }}
                      />
                    ))}
                </>
              )}

            {validGeometry &&
              (validGeometry.type === "Polygon" || validGeometry.type === "MultiPolygon") &&
              polygonToGeoJSON(validGeometry).length > 0 && (
                <>
                  <Source
                    id="geometryFieldPolygon"
                    key="geometryFieldPolygon"
                    type="geojson"
                    data={featureCollection(polygonToGeoJSON(validGeometry))}
                  />
                  <Layer
                    id="geometryFieldPolygon-fill"
                    key="geometryFieldPolygon-fill"
                    source="geometryFieldPolygon"
                    type="fill"
                    paint={{
                      "fill-color": "black",
                      "fill-opacity": 0.3,
                    }}
                  />
                  <Layer
                    id="geometryFieldPolygon-outline"
                    key="geometryFieldPolygon-outline"
                    source="geometryFieldPolygon"
                    type="line"
                    paint={{
                      "line-width": 3,
                      "line-color": "black",
                      "line-opacity": 0.8,
                    }}
                  />
                </>
              )}
          </Map>
        </div>
      ) : (
        <p className="mt-2 mb-0 min-h-[300px] text-sm">
          <strong>Achtung Validierung:</strong> Dieser Fehler muss behoben werden. Aus technischen
          Gründen kann man das Formular trotzdem speichern. Das würde dann aber zu einer defekten
          Applikation führen.
        </p>
      )}
    </div>
  )
}
