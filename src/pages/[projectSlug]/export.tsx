import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { subsectionsBbox } from "@/src/core/components/Map/utils"
import { Spinner } from "@/src/core/components/Spinner"
import { whiteButtonStyles } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H2, longTitle, seoTitleSlug, shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { BlitzPage } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection, lineString, multiLineString, point } from "@turf/helpers"
import { bbox, cleanCoords, lineSlice, nearestPointOnLine } from "@turf/turf"
import { clsx } from "clsx"
import type { Feature, LineString, Point } from "geojson"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { Layer, MapGeoJSONFeature, MapLayerMouseEvent, Marker, Source } from "react-map-gl/maplibre"

// This became quite hacky in the end. We should not trust it completely.
function stringifyGeoJSON(geojson: any) {
  return JSON.stringify(
    geojson,
    function (_key, value) {
      // Check if the value is an array and represents coordinates
      if (
        Array.isArray(value) &&
        value.length >= 2 &&
        typeof value[0] === "number" &&
        typeof value[1] === "number"
      ) {
        // Convert the array to a string with coordinates in a single line
        return "[" + value.join(", ") + "]"
      }
      return value
    },
    2,
  )
    ?.replaceAll('"[', "[")
    ?.replaceAll(']"', "]")
}

export const ExportWithQuery = () => {
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })

  // ===== Base Data =====
  const geoJsonFeatureCollection = featureCollection(
    subsections.map((subs, index) => {
      const properties = {
        // data: JSON.stringify(subs, undefined, 1),
        order: subs.order,
        slug: subs.slug,
        shortTitle: shortTitle(subs.slug),
        longTitle: longTitle(subs.slug),
        start: subs.start,
        end: subs.end,
        startGeom: subs.geometry.at(0),
        endGeom: subs.geometry.at(-1),
        color: index % 2 === 0 ? "#0D1C31" : "#2C62A9",
      }
      return lineString(subs.geometry, properties, { bbox: bbox(lineString(subs.geometry)) })
    }),
  )
  const geoJsonLinestring = lineString(subsections.map((subs) => subs.geometry).flat())

  // nearestPointOnLine() requires a LineString without duplicate coordinates - this is a bug reported here: https://github.com/Turfjs/turf/issues/2808#event-3187358882
  // when the fix is released we can remove cleanCoords()
  const cleanedGeoJsonLinestring = cleanCoords(geoJsonLinestring)

  const dotsGeoms = subsections
    .map((subsection) => [subsection.geometry.at(0), subsection.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  // ===== Click Feature, NewLine Feature =====
  const [clickedFeatures, setClickedFeatures] = useState<MapGeoJSONFeature[] | undefined>(undefined)
  const [pointOneClicked, setPointOneClicked] = useState<Feature<Point> | undefined>(undefined)
  const [pointOneLine, setPointOneLine] = useState<Feature<Point> | undefined>(undefined)
  const [pointTwoClicked, setPointTwoClicked] = useState<Feature<Point> | undefined>(undefined)
  const [pointTwoLine, setPointTwoLine] = useState<Feature<Point> | undefined>(undefined)
  const [newLine, setNewLine] = useState<Feature<LineString> | undefined>(undefined)

  const handleClick = (event: MapLayerMouseEvent) => {
    event.features && setClickedFeatures(event.features)

    if (!pointOneLine) {
      // Change back to the simpler… once https://github.com/visgl/react-map-gl/issues/2239 is resolved
      // const clickedPoint = point(event.lngLat.toArray())
      const clickedPoint = point([event.lngLat.lng, event.lngLat.lat])
      setPointOneClicked(point(clickedPoint.geometry.coordinates, { color: "#B68C06", radius: 8 }))
      const nearestPoint = nearestPointOnLine(cleanedGeoJsonLinestring, clickedPoint)
      setPointOneLine(nearestPoint)
    } else {
      // const clickedPoint = point(event.lngLat.toArray())
      const clickedPoint = point([event.lngLat.lng, event.lngLat.lat])
      setPointTwoClicked(point(clickedPoint.geometry.coordinates, { color: "#B68C06", radius: 8 }))
      const nearestPoint = nearestPointOnLine(cleanedGeoJsonLinestring, clickedPoint)
      setPointTwoLine(nearestPoint)

      const newLine = lineSlice(pointOneLine, nearestPoint, cleanedGeoJsonLinestring)
      setNewLine(newLine)
    }
  }

  const handleResetMapPoints = () => {
    setPointOneClicked(undefined)
    setPointOneLine(undefined)
    setPointTwoClicked(undefined)
    setPointTwoLine(undefined)
    setNewLine(undefined)
  }

  // ===== Points via Textarea =====
  type FormProp = { testPointsString: string }
  const { handleSubmit, register } = useForm<FormProp>()
  const [testPoints, setTestPoints] = useState<Feature<Point>[] | undefined>(undefined)
  const [testPointsOnLine, setTestPointsOnLine] = useState<Feature<Point>[] | undefined>(undefined)
  const [testPointLineSegments, setTestPontLineSegments] = useState<
    Feature<LineString>[] | undefined
  >(undefined)

  const handleShowPoints = ({ testPointsString }: FormProp) => {
    const points = testPointsString.split("\n").reduce((acc: [number, number][], line: string) => {
      const [lng, lat] = line
        .trim()
        .split(",")
        .map((e) => e.replace(/[^\d.,]/g, "")) // cleanup all except number and point
        .map(parseFloat)
      if (lng && lat && !isNaN(lng) && !isNaN(lat)) {
        acc.push([lng, lat])
      }
      return acc
    }, [])
    setTestPoints(points.map((p) => point(p)))
    const testPointsOnLine = points.map((p) =>
      point(nearestPointOnLine(cleanedGeoJsonLinestring, p).geometry.coordinates),
    )
    setTestPointsOnLine(testPointsOnLine)

    // Slice the lineString between the given (and snapped) coordinates.
    testPointsOnLine?.forEach((pointPoint, index) => {
      const startPoint = pointPoint
      const endPoint = testPointsOnLine.at(index + 1)
      if (endPoint) {
        const segment = lineSlice(startPoint, endPoint, cleanedGeoJsonLinestring)
        setTestPontLineSegments((prev) => [...(prev || []), segment])
      }
    })
  }

  return (
    <>
      <MetaTags
        noindex
        title={`Export und Schnittpunkt-Finder für ${seoTitleSlug(project.slug)}`}
      />
      <PageHeader
        title={`Export und Schnittpunkt-Finder für ${shortTitle(project.slug)}`}
        className="mt-12"
      />

      <H2>Planungsabschnitte Karte</H2>

      {/* ===== Points via Textarea ===== */}
      <details className="mb-5 rounded border p-2">
        <summary className="cursor-pointer">Testdaten auf der Karte anzeigen</summary>
        <form onSubmit={handleSubmit(handleShowPoints)} className="space-y-2">
          <div className="mt-6 flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <h4 className="font-semibold">
                Format: <code>long,lat</code>, eine Zeile pro Punkt
              </h4>
              <textarea
                {...register("testPointsString")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button type="submit" className={clsx(whiteButtonStyles, "!pb-1 !pt-1 pl-2 pr-2")}>
                Punkte anzeigen
              </button>
            </div>
            {testPointsOnLine && (
              <div className="flex flex-1 flex-col gap-2">
                <h4 className="font-semibold">
                  Erkannte, gemappte Punkte{" "}
                  <span className="font-light ml-0.5 text-gray-500">
                    (Rot; Gelb der original Punkt)
                  </span>
                </h4>
                <div className="prose max-w-none">
                  <pre>
                    <code>
                      {stringifyGeoJSON(testPointsOnLine.map((p) => p.geometry.coordinates))}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
          {testPointsOnLine && (
            <div className="prose !mt-6 max-w-none">
              <details>
                <summary className="cursor-pointer font-semibold">Teilstrecken</summary>
                <div className="grid gap-2 sm:grid-cols-3">
                  {testPointLineSegments?.map((line) => {
                    const start = line.geometry.coordinates.at(0)?.map((c) => c.toFixed(4))
                    const end = line.geometry.coordinates.at(-1)?.map((c) => c.toFixed(4))
                    return (
                      <details key={stringifyGeoJSON([start, end])} open>
                        <summary className="cursor-pointer">
                          <h4 className="inline-block">
                            Abschnitt
                            <br />
                            {stringifyGeoJSON(start)} {stringifyGeoJSON(end)}
                          </h4>
                        </summary>
                        <pre>
                          <code>{stringifyGeoJSON(line.geometry.coordinates)}</code>
                        </pre>
                      </details>
                    )
                  })}
                </div>
              </details>
            </div>
          )}
        </form>
      </details>

      <BaseMap
        id="exportSubsections"
        initialViewState={{
          bounds: subsectionsBbox(subsections),
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClick}
        interactiveLayerIds={["export"]}
        dots={dotsGeoms}
        hash
      >
        {/* ===== Base Data ===== */}
        <Source id="export" key="export" type="geojson" data={geoJsonFeatureCollection}>
          <Layer
            id="export"
            type="line"
            paint={{
              "line-width": 7,
              "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
              "line-opacity": 0.75,
            }}
          />
        </Source>

        {/* ===== Click Feature, NewLine Feature ===== */}
        {newLine && (
          <Source
            id="newLine"
            // Use key to force a rerender when the data changed
            key={`newLine_${JSON.stringify([
              pointOneLine?.geometry?.coordinates,
              pointTwoLine?.geometry?.coordinates,
            ])}`}
            type="geojson"
            data={newLine}
          >
            <Layer
              id="newLine"
              type="line"
              paint={{
                "line-width": 2,
                "line-color": "white", //"#E5007D",
                "line-opacity": 1,
                "line-dasharray": [0.7, 0.7],
              }}
            />
          </Source>
        )}
        <Source
          id="nearestPoint"
          key="nearestPoint"
          type="geojson"
          data={featureCollection(
            [pointOneLine, pointOneClicked, pointTwoLine, pointTwoClicked].filter(Boolean),
          )}
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
        <Source
          id="nearestPointLine"
          key="nearestPointLine"
          type="geojson"
          data={multiLineString(
            [
              [pointOneLine?.geometry?.coordinates, pointOneClicked?.geometry?.coordinates],
              [pointTwoLine?.geometry?.coordinates, pointTwoClicked?.geometry?.coordinates],
            ]
              .map((e) => e.filter(Boolean))
              .filter((e) => e.length),
          )}
        >
          <Layer
            id="nearestPointLine"
            type="line"
            paint={{
              "line-width": 2,
              "line-color": "#B68C06",
              "line-opacity": 0.5,
              "line-dasharray": [1, 1],
            }}
          />
        </Source>

        {/* ===== Dots Marker ===== */}
        {Array.isArray(dotsGeoms) &&
          dotsGeoms.map((point) => {
            return (
              <Marker
                key={JSON.stringify(point)}
                latitude={point[1]}
                longitude={point[0]}
                anchor="right"
              >
                <div className="mr-3 rounded bg-gray-700 px-1 py-0 text-xs text-gray-50">
                  {point[0].toFixed(4)}, {point[1].toFixed(4)}
                </div>
              </Marker>
            )
          })}

        {/* ===== Points via Textarea ===== */}
        {Array.isArray(testPointsOnLine) &&
          testPointsOnLine.map((point, index) => {
            return (
              <Marker
                key={JSON.stringify(point.geometry.coordinates)}
                latitude={point.geometry.coordinates[1] as number}
                longitude={point.geometry.coordinates[0] as number}
                anchor="left"
              >
                <div className="ml-3 rounded bg-red-700 px-1 py-0 text-xs text-red-50">
                  {index}: {point.geometry.coordinates[0]?.toFixed(3)},{" "}
                  {point.geometry.coordinates[1]?.toFixed(3)}
                </div>
              </Marker>
            )
          })}
        <Source
          id="testPointsOnLine"
          key="testPointsOnLine"
          type="geojson"
          data={featureCollection(testPointsOnLine || [])}
        >
          <Layer
            id="testPointsOnLine"
            type="circle"
            paint={{
              "circle-radius": 5,
              "circle-color": "#BE123C",
              "circle-opacity": 0.9,
            }}
          />
        </Source>
        <Source
          id="testPoints"
          key="testPoints"
          type="geojson"
          data={featureCollection(testPoints || [])}
        >
          <Layer
            id="testPoints"
            type="circle"
            paint={{
              "circle-radius": 2,
              "circle-color": "#F8C62B",
              "circle-opacity": 1,
            }}
          />
        </Source>
      </BaseMap>

      {/* ===== Points via Textarea ===== */}
      <div className="prose my-2 grid max-w-none gap-2 md:grid-cols-2">
        <div>
          <h4>Punkt 1 auf Linie (Klick in Karte)</h4>
          <details className="text-xs">
            <summary className="cursor-pointer">Details</summary>
            <pre>
              <code>{stringifyGeoJSON(pointOneLine)}</code>
            </pre>
          </details>
          <pre className="mt-2">
            <code>[{pointOneLine?.geometry?.coordinates.join(", ")}]</code>
          </pre>

          <h4>Punkt 2 auf Linie</h4>
          <details className="text-xs">
            <summary className="cursor-pointer">Details</summary>
            <pre>
              <code>{stringifyGeoJSON(pointTwoLine)}</code>
            </pre>
          </details>
          <pre className="mt-2">
            <code>[{pointTwoLine?.geometry?.coordinates.join(", ")}]</code>
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h4>Linie dazwischen</h4>
            <div>
              <button
                onClick={handleResetMapPoints}
                className={clsx(whiteButtonStyles, "!pb-1 !pt-1 pl-2 pr-2")}
              >
                Reset
              </button>
            </div>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer">Details</summary>
            <pre>
              <code>{stringifyGeoJSON(newLine)}</code>
            </pre>
          </details>
          <pre className="mt-2">
            <code>{stringifyGeoJSON(newLine?.geometry?.coordinates)}</code>
          </pre>
        </div>
      </div>

      {/* ===== Click Feature, NewLine Feature ===== */}
      <div className="prose mb-12 mt-2 max-w-none">
        {clickedFeatures?.map((feature) => {
          return (
            <div key={feature.properties?.slug} className="grid gap-3 md:grid-cols-2">
              <pre>
                <code>{stringifyGeoJSON(feature?.properties)}</code>
              </pre>
              <pre>
                <code>{stringifyGeoJSON(feature?.geometry)}</code>
              </pre>
            </div>
          )
        })}
      </div>

      <H2>Planungsabschnitte GeoJSON</H2>
      <details>
        <summary className="cursor-pointer">Anzeigen…</summary>
        <div className="prose max-w-none">
          <pre>
            <code>{stringifyGeoJSON(geoJsonFeatureCollection)}</code>
          </pre>
        </div>
      </details>

      <SuperAdminLogData data={{ project, subsections }} />
    </>
  )
}

const ExportPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <ExportWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ExportPage.authenticate = true

export default ExportPage
