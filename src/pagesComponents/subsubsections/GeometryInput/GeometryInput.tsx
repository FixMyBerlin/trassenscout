import { getCenterOfMass } from "@/src/core/components/Map/utils/getCenterOfMass"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import { LabeledRadiobuttonGroup } from "@/src/core/components/forms/LabeledRadiobuttonGroup"
import { linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { validateGeometryByType } from "@/src/server/subsubsections/schema"
import { useQuery } from "@blitzjs/rpc"
import { bbox, bboxPolygon, lineString } from "@turf/turf"
import { clsx } from "clsx"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { GeometryInputMap } from "./GeometryInputMap"

export const GeometryInput = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })

  const { setValue, watch } = useFormContext()
  const geometry = watch("geometry")
  const type = watch("type")
  const [geometryInputMode, setGeometryInputMode] = useState<"MAP" | "RAW">(
    type === "POLYGON" ? "RAW" : "MAP",
  )

  const schemaResult = validateGeometryByType(type || "LINE", geometry)

  const handleTypeChange = (newType: string) => {
    if (newType === "POLYGON") {
      setGeometryInputMode("RAW")
    } else if (newType === "LINE" || newType === "POINT") {
      setGeometryInputMode("MAP")
    }
  }

  useEffect(() => {
    const invalidGeometry = !schemaResult.success
    if (invalidGeometry && geometry !== undefined) {
      // Set default geometry based on type
      switch (type) {
        case "LINE":
          // Default to subsection geometry as LineString
          setValue("geometry", subsection.geometry)
          break
        case "POINT":
          // Default to center of subsection as Point
          const center = getCenterOfMass(subsection.geometry)
          setValue("geometry", {
            type: "Point",
            coordinates: center,
          })
          break
        case "POLYGON":
          // Create a polygon from the subsection's bounding box
          const subsectionLine = lineString(subsection.geometry.coordinates)
          const subsectionBbox = bbox(subsectionLine)
          const bboxPoly = bboxPolygon(subsectionBbox)
          setValue("geometry", bboxPoly.geometry)
          break
      }
    }
  }, [schemaResult.success, setValue, subsection.geometry.coordinates, type, geometry])

  return (
    <>
      <LabeledRadiobuttonGroup
        scope="type"
        label="Geometrie des Eintrags"
        classNameItemWrapper="flex flex-wrap gap-4"
        items={[
          {
            value: "LINE",
            label: "Linie", // fka Regelführung (RF) - unterstützt LineString und MultiLineString
          },
          {
            value: "POINT",
            label: "Punkt", // fka Sonderführung (SF)
          },
          {
            value: "POLYGON",
            label: "Fläche", // unterstützt Polygon und MultiPolygon
          },
        ]}
        onChange={handleTypeChange}
        help={
          type === "LINE"
            ? "Klicken Sie innerhalb des blau markierten Planungsabschnitts auf die gewünschte Stelle, um den Eintrag dort zu verorten. Achten Sie darauf, dass die neue Linie nicht auf bereits vorhandenen (grau dargestellten) Linien verläuft."
            : type === "POINT"
              ? "Klicken Sie innerhalb des blau markierten Planungsabschnitts, um den Punkt zu setzen."
              : type === "POLYGON"
                ? "Geben Sie die Polygon-Geometrie als GeoJSON ein (oder fügen Sie sie ein). Die Geometrie wird auf der Karte angezeigt. Unterstützt Polygon und MultiPolygon."
                : undefined
        }
      />
      {type && (
        <section>
          <nav>
            <div className="sm:hidden">
              <label htmlFor="geometry-tabs" className="sr-only">
                Geometrie-Eingabemodus
              </label>
              <select
                id="geometry-tabs"
                name="geometry-tabs"
                className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
                value={geometryInputMode}
                onChange={(event) => {
                  setGeometryInputMode(event.target.value as "MAP" | "RAW")
                }}
              >
                <option value="MAP">Karte</option>
                <option value="RAW">GeoJSON</option>
              </select>
            </div>
            <div className="-mb-px hidden w-full gap-1 sm:flex" aria-label="Geometry Input Tabs">
              {[
                { key: "MAP", label: "Karte" },
                { key: "RAW", label: "GeoJSON" },
              ].map((tab) => {
                const current = geometryInputMode === tab.key

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setGeometryInputMode(tab.key as "MAP" | "RAW")}
                    className={clsx(
                      current ? "bg-gray-100" : "bg-gray-50",
                      "flex rounded-t-md px-3 py-2 text-sm",
                      linkStyles,
                    )}
                    aria-current={current ? "page" : undefined}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="rounded-r-md rounded-b-md bg-gray-100 p-2">
            {geometryInputMode === "MAP" ? (
              <MapProvider>
                <GeometryInputMap subsection={subsection} />
              </MapProvider>
            ) : (
              <LabeledGeometryField
                name="geometry"
                label="GeoJSON Geometrie (`Point`, `LineString`, `MultiLineString`, `Polygon`, oder `MultiPolygon`)"
                outerProps={{
                  className: "rounded-sm border border-gray-200 bg-gray-100 p-3 text-gray-700",
                }}
              />
            )}
          </div>
        </section>
      )}
    </>
  )
}
