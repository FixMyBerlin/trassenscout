import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { lineString, point } from "@turf/helpers"
import { bbox } from "@turf/turf"
import clsx from "clsx"
import maplibregl from "maplibre-gl"
import React from "react"
import { useFormContext } from "react-hook-form"
import Map, { Layer, LngLatBoundsLike, NavigationControl, ScaleControl, Source } from "react-map-gl"
import { vectorStyle } from "src/projects/components/Map/BaseMap"
import { z } from "zod"

type Props = {
  name: string
  hasError: boolean
}

export const LabeledGeometryFieldPreview: React.FC<Props> = ({ name, hasError }) => {
  const { watch, getValues } = useFormContext()
  const geometry = watch(name)
  const geometryType = getValues("type") || "ROUTE" // Subsections don't have a `type` but area a ROUTE

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
        schemaResult.success ? "bg-gray-100" : "border-red-800 bg-red-100"
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
                      bounds: bbox(lineString(geometry)) as LngLatBoundsLike,
                      fitBoundsOptions: { padding: 20 },
                    }
                  : {}),
                ...(geometryType === "AREA"
                  ? { latitude: geometry.at(1), longitude: geometry.at(0), zoom: 14 }
                  : {}),
              }}
              id="preview"
              mapLib={maplibregl}
              mapStyle={vectorStyle}
              scrollZoom={false}
            >
              <NavigationControl showCompass={false} />
              <ScaleControl />
              {geometryType === "ROUTE" ? (
                <Source type="geojson" data={lineString(geometry)}>
                  <Layer
                    type="line"
                    paint={{
                      "line-width": 4,
                      "line-color": "black",
                      "line-opacity": 0.6,
                    }}
                  />
                </Source>
              ) : (
                <Source type="geojson" data={point(geometry)}>
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
            <summary>Geometry</summary>
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
