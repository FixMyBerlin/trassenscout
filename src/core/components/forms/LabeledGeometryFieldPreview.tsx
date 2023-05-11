import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { lineString } from "@turf/helpers"
import { bbox } from "@turf/turf"
import clsx from "clsx"
import maplibregl from "maplibre-gl"
import { useFormContext } from "react-hook-form"
import Map, { Layer, LngLatBoundsLike, NavigationControl, ScaleControl, Source } from "react-map-gl"
import { vectorStyle } from "src/projects/components/Map/BaseMap"
import { z } from "zod"

type Props = {
  name: string
  hasError: boolean
}

export const LabeledGeometryFieldPreview: React.FC<Props> = ({ name, hasError }) => {
  const { watch } = useFormContext()
  const watchwatch = watch(name)

  const LineStringSchema = z.array(z.array(z.number()).min(2).max(2).nonempty()).nonempty()

  const schemaResult = LineStringSchema.safeParse(watchwatch)

  return (
    <div
      className={clsx(
        "rounded border p-3 text-gray-700",
        schemaResult.success ? "bg-gray-100" : "border-red-800 bg-red-100"
      )}
    >
      <h3 className="m-0 mb-3 flex items-center gap-1 text-sm font-semibold">
        Geometrieprüfung:{" "}
        {schemaResult.success && !hasError && (
          <CheckBadgeIcon className="h-5 w-5 pb-0.5 text-green-700" />
        )}
      </h3>
      {schemaResult.success ? (
        <>
          <div className="mb-3 h-[500px] w-full overflow-clip rounded-md drop-shadow-md">
            <Map
              initialViewState={{
                bounds: bbox(lineString(watchwatch)) as LngLatBoundsLike,
                fitBoundsOptions: { padding: 10 },
              }}
              id="preview"
              mapLib={maplibregl}
              mapStyle={vectorStyle}
              scrollZoom={false}
            >
              <NavigationControl showCompass={false} />
              <ScaleControl />
              <Source type="geojson" data={lineString(watchwatch)}>
                <Layer
                  type="line"
                  paint={{
                    "line-width": 4,
                    "line-color": "black",
                    "line-opacity": 0.6,
                  }}
                />
              </Source>
            </Map>
          </div>
          <pre className="m-0 text-xs leading-none">{JSON.stringify(watchwatch, undefined, 2)}</pre>
        </>
      ) : (
        <>
          <p className="mt-2 mb-0 text-sm">
            Ungültiger <code>LineString</code>. Das Format muss sein:
            <code>[[9.1943,48.8932],[9.2043,48.8933]]</code>
          </p>
          <p className="mt-2 mb-0 text-sm">
            <strong>Achtung Validierung:</strong> Dieser Fehler muss behoben werden. Aus technischen
            Gründen kann man das Formular trotzdem speichern. Das würde dann aber zu einer defekten
            Appliation führen.
          </p>
        </>
      )}
    </div>
  )
}
