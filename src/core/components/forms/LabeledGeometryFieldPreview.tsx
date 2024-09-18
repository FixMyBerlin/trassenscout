import { vectorStyle } from "@/src/core/components/Map/BaseMap"
import { SubsubsectionWithPosition } from "@/src/subsubsections/queries/getSubsubsection"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { lineString, point } from "@turf/helpers"
import { bbox } from "@turf/turf"
import { clsx } from "clsx"
import type { Position } from "geojson"
import { useFormContext } from "react-hook-form"
import Map, {
  Layer,
  LngLatBoundsLike,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre"
import { z } from "zod"
import { Link } from "../links"

type Props = {
  name: string
  hasError: boolean
}

// SubsectionWithPosition["geometry"]
// SubsubsectionWithPosition["geometry"]
// ^- but we cannot use those, because we cannot type narrow them properly
// Also, we need turf's Position types in this file
type RouteGeomtry = Position[] // [number, number][]
type AreaGeometry = Position // [number, number]

export const LabeledGeometryFieldPreview: React.FC<Props> = ({ name, hasError }) => {
  const { watch, getValues } = useFormContext()
  const geometry = watch(name) as RouteGeomtry | AreaGeometry
  const geometryType = (getValues("type") || "ROUTE") as SubsubsectionWithPosition["type"] // Subsections don't have a `type` but area a ROUTE

  const LineStringSchema = z.array(z.array(z.number()).min(2).max(2).nonempty()).nonempty()
  const PointSchema = z.array(z.number()).min(2).max(2).nonempty()

  const schemaResult =
    geometryType === "ROUTE"
      ? LineStringSchema.safeParse(geometry)
      : PointSchema.safeParse(geometry)

  return (
    <div
      className={clsx(
        "rounded border p-3 text-gray-700",
        schemaResult.success ? "bg-gray-100" : "border-red-800 bg-red-100",
      )}
    >
      <h3 className="m-0 mb-3 flex items-center gap-1 text-sm font-semibold">
        Geometrieprüfung: {geometryType === "ROUTE" ? "Liniengeometrie" : "Punktgeometrie"}
        {schemaResult.success && !hasError && (
          <CheckBadgeIcon className="h-5 w-5 pb-0.5 text-green-700" />
        )}
      </h3>
      {schemaResult.success ? (
        <>
          <div className="mb-3 h-[300px] w-full overflow-clip rounded-md drop-shadow-md">
            <Map
              initialViewState={{
                ...(geometryType === "ROUTE"
                  ? {
                      bounds: bbox(lineString(geometry as RouteGeomtry)) as LngLatBoundsLike,
                      fitBoundsOptions: { padding: 40 },
                    }
                  : {}),
                ...(geometryType === "AREA"
                  ? {
                      latitude: geometry.at(1) as number,
                      longitude: geometry.at(0) as number,
                      zoom: 14,
                    }
                  : {}),
              }}
              id="preview"
              mapStyle={vectorStyle}
              scrollZoom={false}
              // @ts-expect-error: See https://github.com/visgl/react-map-gl/issues/2310
              RTLTextPlugin={null}
            >
              <NavigationControl showCompass={false} />
              <ScaleControl />
              {geometryType === "ROUTE" ? (
                <>
                  <Source type="geojson" data={lineString(geometry as RouteGeomtry)}>
                    <Layer
                      type="line"
                      paint={{
                        "line-width": 4,
                        "line-color": "black",
                        "line-opacity": 0.6,
                      }}
                    />
                  </Source>
                  {/* Highlight the start of a Geometry so help understand the direction */}
                  <Source key="dot" type="geojson" data={point(geometry[0] as Position)}>
                    <Layer
                      type="circle"
                      paint={{
                        "circle-radius": 6,
                        "circle-color": "black",
                      }}
                    />
                  </Source>
                </>
              ) : (
                <Source type="geojson" data={point(geometry as AreaGeometry)}>
                  <Layer
                    type="circle"
                    paint={{
                      "circle-radius": 4,
                      "circle-color": "black",
                      "circle-opacity": 0.6,
                    }}
                  />
                </Source>
              )}
            </Map>
          </div>
          <details className="prose prose-sm">
            <summary className="cursor-pointer">Geometry</summary>
            <Link
              blank
              href={`http://play.placemark.io/?load=data:application/json,${encodeURIComponent(
                JSON.stringify(
                  geometryType === "ROUTE"
                    ? lineString(geometry as RouteGeomtry)
                    : point(geometry as AreaGeometry),
                ),
              )}`}
            >
              Auf placemark.io öffnen
            </Link>
            <pre className="m-0 text-xs leading-none">{JSON.stringify(geometry, undefined, 2)}</pre>
          </details>
        </>
      ) : (
        <p className="mb-0 mt-2 min-h-[300px] text-sm">
          <strong>Achtung Validierung:</strong> Dieser Fehler muss behoben werden. Aus technischen
          Gründen kann man das Formular trotzdem speichern. Das würde dann aber zu einer defekten
          Appliation führen.
        </p>
      )}
    </div>
  )
}
