import { Link } from "@/src/core/components/links"
import { vectorStyle } from "@/src/core/components/Map/BaseMap"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "@/src/core/components/Map/utils/pointToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { validateGeometryByType } from "@/src/server/subsubsections/schema"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { featureCollection, lineString, point } from "@turf/helpers"
import { bbox } from "@turf/turf"
import { clsx } from "clsx"
import type { Geometry } from "geojson"
import { useFormContext } from "react-hook-form"
import Map, {
  Layer,
  LngLatBoundsLike,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre"

type Props = {
  name: string
  hasError: boolean
}

export const LabeledGeometryFieldPreview = ({ name, hasError }: Props) => {
  const { watch, getValues } = useFormContext()
  const geometry = watch(name) as Geometry | undefined
  const geometryType = (getValues("type") || "LINE") as SubsubsectionWithPosition["type"] // Subsections don't have a `type` but are LINE

  const schemaResult = validateGeometryByType(geometryType, geometry)

  return (
    <div
      className={clsx(
        "rounded-sm border border-gray-200 p-3 text-gray-700",
        schemaResult.success ? "bg-gray-100" : "border-red-800 bg-red-100",
      )}
    >
      <h3 className="m-0 mb-3 flex items-center justify-between gap-1 text-sm font-semibold">
        <span className="flex items-center gap-1">
          Geometrieprüfung:{" "}
          {geometryType === "LINE"
            ? "Liniengeometrie"
            : geometryType === "POINT"
              ? "Punktgeometrie"
              : geometryType === "POLYGON"
                ? "Polygon-Geometrie"
                : "Geometrie"}
          {schemaResult.success && !hasError && (
            <CheckBadgeIcon className="h-5 w-5 pb-0.5 text-green-700" />
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
        <>
          <div className="mb-3 h-[300px] w-full overflow-clip rounded-md drop-shadow-md">
            <Map
              key={geometry ? JSON.stringify(geometry) : "empty"}
              initialViewState={{
                ...(geometry &&
                (geometry.type === "LineString" ||
                  geometry.type === "MultiLineString" ||
                  geometry.type === "Polygon" ||
                  geometry.type === "MultiPolygon")
                  ? {
                      bounds: bbox(
                        geometry.type === "LineString" || geometry.type === "MultiLineString"
                          ? featureCollection(lineStringToGeoJSON(geometry) ?? [])
                          : geometry.type === "Polygon" || geometry.type === "MultiPolygon"
                            ? featureCollection(polygonToGeoJSON(geometry) ?? [])
                            : lineString([
                                [0, 0],
                                [0, 0],
                              ]), // Fallback for invalid geometries
                      ) as LngLatBoundsLike,
                      fitBoundsOptions: { padding: 40 },
                    }
                  : {}),
                ...(geometry && geometry.type === "Point"
                  ? {
                      latitude: geometry.coordinates[1],
                      longitude: geometry.coordinates[0],
                      zoom: 14,
                    }
                  : {}),
              }}
              id="preview"
              mapStyle={vectorStyle}
              scrollZoom={false}
            >
              <NavigationControl showCompass={false} />
              <ScaleControl />

              {geometry && geometry.type === "Point" && pointToGeoJSON(geometry) && (
                <>
                  <Source
                    id="geometryFieldPoint"
                    key="geometryFieldPoint"
                    type="geojson"
                    data={pointToGeoJSON(geometry)!}
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

              {geometry &&
                (geometry.type === "LineString" || geometry.type === "MultiLineString") &&
                lineStringToGeoJSON(geometry) && (
                  <>
                    <Source
                      id="geometryFieldLine"
                      key="geometryFieldLine"
                      type="geojson"
                      data={featureCollection(lineStringToGeoJSON(geometry)!)}
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
                    {geometry.type === "LineString" && geometry.coordinates[0] && (
                      <>
                        <Source
                          id="geometryFieldLinePoint"
                          key="geometryFieldLinePoint"
                          type="geojson"
                          data={point(geometry.coordinates[0])}
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
                    {geometry.type === "MultiLineString" &&
                      geometry.coordinates.map((coords, index) => {
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
                    {geometry.type === "MultiLineString" &&
                      geometry.coordinates.map((_, index) => (
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

              {geometry &&
                (geometry.type === "Polygon" || geometry.type === "MultiPolygon") &&
                polygonToGeoJSON(geometry) && (
                  <>
                    <Source
                      id="geometryFieldPolygon"
                      key="geometryFieldPolygon"
                      type="geojson"
                      data={featureCollection(polygonToGeoJSON(geometry)!)}
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

          <details className="prose prose-sm">
            <summary className="cursor-pointer">Geometry</summary>
            <pre className="m-0 text-xs leading-none">{JSON.stringify(geometry, undefined, 2)}</pre>
          </details>
        </>
      ) : (
        <p className="mt-2 mb-0 min-h-[300px] text-sm">
          <strong>Achtung Validierung:</strong> Dieser Fehler muss behoben werden. Aus technischen
          Gründen kann man das Formular trotzdem speichern. Das würde dann aber zu einer defekten
          Appliation führen.
        </p>
      )}
    </div>
  )
}
