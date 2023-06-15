import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import {
  Feature,
  Point,
  featureCollection,
  lineString,
  multiLineString,
  point,
} from "@turf/helpers"
import { bbox, nearestPointOnLine } from "@turf/turf"
import { Suspense, useState } from "react"
import { Layer, MapboxGeoJSONFeature, Source } from "react-map-gl"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { BaseMap } from "src/core/components/Map/BaseMap"
import { sectionsBbox } from "src/core/components/Map/utils"
import { Spinner } from "src/core/components/Spinner"
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
  const geoJsonLinestring = multiLineString(subsections.map((subs) => subs.geometry))

  const dotsGeoms = subsections
    .map((subsection) => [subsection.geometry.at(0), subsection.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const [clickedFeatures, setClickedFeatures] = useState<MapboxGeoJSONFeature[] | undefined>(
    undefined
  )
  const [pointClicked, setPointClicked] = useState<Feature<Point> | undefined>(undefined)
  const [pointOnLine, setPointOnLine] = useState<Feature<Point> | undefined>(undefined)
  const handleClick = (event: mapboxgl.MapLayerMouseEvent) => {
    event.features && setClickedFeatures(event.features)

    const clickedPoint = point(event.lngLat.toArray())
    setPointClicked(point(clickedPoint.geometry.coordinates, { color: "#B68C06" }))
    const nearestPoint = nearestPointOnLine(geoJsonLinestring, clickedPoint)
    setPointOnLine(nearestPoint)
  }

  return (
    <>
      <MetaTags noindex title={`Export für ${seoTitleSlug(project.slug)}`} />
      <PageHeader title={`Export für ${shortTitle(project.slug)}`} className="mt-12" />

      <H2>Planungsabschnitte Karte</H2>
      <BaseMap
        id="exportSubsections"
        initialViewState={{
          bounds: sectionsBbox(sections),
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClick}
        interactiveLayerIds={["export"]}
        dots={dotsGeoms}
      >
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
        {pointOnLine && pointClicked && (
          <>
            <Source
              key="nearestPoint"
              type="geojson"
              data={featureCollection([pointOnLine, pointClicked])}
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
              data={lineString([
                pointOnLine.geometry.coordinates,
                pointClicked.geometry.coordinates,
              ])}
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
          </>
        )}
      </BaseMap>
      <div className="prose my-2 max-w-none">
        <pre>
          <code>{JSON.stringify(pointOnLine, undefined, 2)}</code>
        </pre>
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
