import { GeoJSONPreviewLink, GeoJSONPreviewPanel } from "@/src/core/components/forms/GeoJSONPreview"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import type { Geometry } from "geojson"
import { ReactNode, useState } from "react"
import { useFormContext } from "react-hook-form"

type GeometryInputBaseProps = {
  label: string
  description?: ReactNode
  children: ReactNode
  /** Determines which geometry types are allowed. "subsection" allows LineString and Polygon only. "subsubsection" allows all types (Point, LineString, Polygon). */
  allowedGeometryTypesFor?: "subsection" | "subsubsection"
}

export const GeometryInputBase = ({
  label,
  description,
  children,
  allowedGeometryTypesFor,
}: GeometryInputBaseProps) => {
  const { watch } = useFormContext()
  const geometry = watch("geometry") as Geometry

  const [isRawMode, setIsRawMode] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Once in raw mode, stay in raw mode (one-way switch)
  if (isRawMode) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        <div className="rounded-md border border-gray-200 bg-gray-100 p-2">
          <LabeledGeometryField
            name="geometry"
            label="GeoJSON Geometrie (`Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, oder `MultiPolygon`)"
            allowedGeometryTypesFor={allowedGeometryTypesFor}
            outerProps={{
              className: "rounded-sm border border-gray-200 bg-white p-3",
            }}
          />
        </div>
      </div>
    )
  }

  const previewLink = <GeoJSONPreviewLink onOpen={() => setIsPreviewOpen(true)} />

  return (
    <section className={description || isPreviewOpen ? "space-y-2" : ""}>
      <div className="mb-1 flex justify-between gap-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {previewLink}
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}

      {isPreviewOpen && (
        <GeoJSONPreviewPanel
          geometry={geometry}
          onEdit={() => setIsRawMode(true)}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      <div className="rounded-md border border-gray-200 bg-gray-100 p-2">{children}</div>
    </section>
  )
}
