import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import {
  Feature,
  LineString,
  Point,
  featureCollection,
  lineString,
  multiLineString,
  point,
} from "@turf/helpers"
import { bbox, lineSlice, nearestPointOnLine } from "@turf/turf"
import clsx from "clsx"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { Layer, MapboxGeoJSONFeature, Marker, Source } from "react-map-gl"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { BaseMap } from "src/core/components/Map/BaseMap"
import { sectionsBbox } from "src/core/components/Map/utils"
import { Spinner } from "src/core/components/Spinner"
import { whiteButtonStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2, longTitle, seoTitleSlug, shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"
import getSubsections from "src/subsections/queries/getSubsections"

export const ExportWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ sections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  })
  const secitonIds = sections.map((s) => s.id)
  const [{ subsections }] = useQuery(getSubsections, {
    where: { sectionId: { in: secitonIds } },
  })

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
    })
  )
  const geoJsonLinestring = lineString(subsections.map((subs) => subs.geometry).flat())

  const dotsGeoms = subsections
    .map((subsection) => [subsection.geometry.at(0), subsection.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const [clickedFeatures, setClickedFeatures] = useState<MapboxGeoJSONFeature[] | undefined>(
    undefined
  )
  const [pointOneClicked, setPointOneClicked] = useState<Feature<Point> | undefined>(undefined)
  const [pointOneLine, setPointOneLine] = useState<Feature<Point> | undefined>(undefined)
  const [pointTwoClicked, setPointTwoClicked] = useState<Feature<Point> | undefined>(undefined)
  const [pointTwoLine, setPointTwoLine] = useState<Feature<Point> | undefined>(undefined)
  const [newLine, setNewLine] = useState<Feature<LineString> | undefined>(undefined)

  const handleClick = (event: mapboxgl.MapLayerMouseEvent) => {
    event.features && setClickedFeatures(event.features)

    if (!pointOneLine) {
      const clickedPoint = point(event.lngLat.toArray())
      setPointOneClicked(point(clickedPoint.geometry.coordinates, { color: "#B68C06" }))
      const nearestPoint = nearestPointOnLine(geoJsonLinestring, clickedPoint)
      setPointOneLine(nearestPoint)
    } else {
      const clickedPoint = point(event.lngLat.toArray())
      setPointTwoClicked(point(clickedPoint.geometry.coordinates, { color: "#B68C06" }))
      const nearestPoint = nearestPointOnLine(geoJsonLinestring, clickedPoint)
      setPointTwoLine(nearestPoint)

      const newLine = lineSlice(pointOneLine, nearestPoint, geoJsonLinestring)
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

  type FormProp = { testPointsString: string }
  const { handleSubmit, register } = useForm<FormProp>()
  const [testPoints, setTestPoints] = useState<[number, number][] | undefined>(undefined)
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
    setTestPoints(points)
  }

  return (
    <>
      <MetaTags noindex title={`Export für ${seoTitleSlug(project.slug)}`} />
      <PageHeader title={`Export für ${shortTitle(project.slug)}`} className="mt-12" />

      <H2>Planungsabschnitte Karte</H2>

      <details className="mb-5 rounded border p-2">
        <summary className="cursor-pointer">Testdaten auf der Karte anzeigen</summary>
        <p className="prose prose-sm">
          Format: <code>long,lat</code>, eine Zeile pro Punkt
        </p>
        <form onSubmit={handleSubmit(handleShowPoints)} className="space-y-2">
          <textarea
            {...register("testPointsString")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button type="submit" className={clsx(whiteButtonStyles, "!pb-1 !pt-1 pl-2 pr-2")}>
            Punkte anzeigen
          </button>
          {testPoints && (
            <div className="prose">
              <pre>
                <code>{JSON.stringify(testPoints, undefined, 2).replaceAll(",\n    ", ", ")}</code>
              </pre>
            </div>
          )}
        </form>
      </details>

      <BaseMap
        id="exportSubsections"
        initialViewState={{
          bounds: sectionsBbox(sections),
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClick}
        interactiveLayerIds={["export"]}
        dots={dotsGeoms}
        hash
      >
        <Source key="newLine" type="geojson" data={newLine}>
          <Layer
            id="newLine"
            type="line"
            paint={{
              "line-width": 2,
              "line-color": "white",
              "line-opacity": 1,
              "line-dasharray": [1, 1],
            }}
          />
        </Source>
        <Source
          key="nearestPoint"
          type="geojson"
          data={featureCollection(
            [pointOneLine, pointOneClicked, pointTwoLine, pointTwoClicked].filter(Boolean)
          )}
        >
          <Layer
            id="nearestPoint"
            type="circle"
            paint={{
              "circle-radius": 17,
              "circle-color": ["case", ["has", "color"], ["get", "color"], "#E5007D"],
              "circle-opacity": 0.5,
            }}
          />
        </Source>
        <Source
          key="nearestPointLine"
          type="geojson"
          data={multiLineString(
            [
              [pointOneLine?.geometry?.coordinates, pointOneClicked?.geometry?.coordinates],
              [pointTwoLine?.geometry?.coordinates, pointTwoClicked?.geometry?.coordinates],
            ]
              .map((e) => e.filter(Boolean))
              .filter((e) => e.length)
          )}
        >
          <Layer
            id="nearestPointLine"
            type="line"
            paint={{
              "line-width": 2,
              "line-color": "black",
              "line-opacity": 0.3,
              "line-dasharray": [1, 1],
            }}
          />
        </Source>
        <Source key="export" type="geojson" data={geoJsonFeatureCollection}>
          <Layer
            id="export"
            type="line"
            paint={{
              "line-width": 7,
              "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
            }}
          />
        </Source>
        {Array.isArray(testPoints) &&
          testPoints.map((point) => {
            return (
              <Marker
                key={JSON.stringify(point)}
                latitude={point[1]}
                longitude={point[0]}
                anchor="left"
              >
                <div className="ml-3 rounded bg-red-700 px-1 py-0 text-xs text-red-50">
                  {point[0].toFixed(3)}, {point[1].toFixed(3)}
                </div>
              </Marker>
            )
          })}
        <Source
          key="testPoints"
          type="geojson"
          data={featureCollection(testPoints?.map((p) => point(p)) || [])}
        >
          <Layer
            id="testPoints"
            type="circle"
            paint={{
              "circle-radius": 5,
              "circle-color": "#BE123C",
              "circle-opacity": 0.9,
            }}
          />
        </Source>
      </BaseMap>
      <div className="prose my-2 grid max-w-none gap-2 md:grid-cols-3">
        <div>
          <h4>Punkt 1 geklickt</h4>
          <pre>
            <code>{JSON.stringify(pointOneLine, undefined, 2)}</code>
          </pre>
        </div>
        <div>
          <h4>Punkt 1 geklickt</h4>
          <pre>
            <code>{JSON.stringify(pointTwoLine, undefined, 2)}</code>
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
          <pre className="mt-0">
            <code>{JSON.stringify(newLine, undefined, 2)}</code>
          </pre>
        </div>
      </div>
      <div className="prose mb-12 mt-2 max-w-none">
        {clickedFeatures?.map((feature) => {
          return (
            <div key={feature.properties?.slug} className="grid gap-3 md:grid-cols-2">
              <pre>
                <code>{JSON.stringify(feature?.properties, undefined, 2)}</code>
              </pre>
              <pre>
                <code>
                  {JSON.stringify(feature?.geometry, undefined, 2).replaceAll(",\n      ", ", ")}
                </code>
              </pre>
            </div>
          )
        })}
      </div>

      <H2>Planungsabschnitte GeoJSON</H2>
      <div className="prose max-w-none">
        <pre>
          <code>{JSON.stringify(geoJsonFeatureCollection, undefined, 2)}</code>
        </pre>
      </div>

      <SuperAdminLogData data={{ project, sections, subsections }} />
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

export default ExportPage
