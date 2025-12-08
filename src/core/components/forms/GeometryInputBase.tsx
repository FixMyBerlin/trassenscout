import { GeoJSONPreviewLink, GeoJSONPreviewPanel } from "@/src/core/components/forms/GeoJSONPreview"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import type { Geometry } from "geojson"
import { ReactNode, useState } from "react"
import { useFormContext } from "react-hook-form"

type GeometryInputBaseProps = {
  label: string
  description: ReactNode
  children: ReactNode
}

export const GeometryInputBase = ({ label, description, children }: GeometryInputBaseProps) => {
  const { watch } = useFormContext()
  const geometry = watch("geometry") as Geometry

  const [isRawMode, setIsRawMode] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Once in raw mode, stay in raw mode (one-way switch)
  if (isRawMode) {
    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <p className="text-sm text-gray-500">
            Bearbeiten Sie die GeoJSON-Geometrie direkt. Der Geometrietyp wird automatisch erkannt.
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-100 p-2">
          <LabeledGeometryField
            name="geometry"
            label="GeoJSON Geometrie (`Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, oder `MultiPolygon`)"
            outerProps={{
              className: "rounded-sm border border-gray-200 bg-white p-3",
            }}
          />
        </div>
      </>
    )
  }

  const previewLink = <GeoJSONPreviewLink onOpen={() => setIsPreviewOpen(true)} />

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex justify-between gap-1">
          <p className="text-sm text-gray-500">{description}</p>
          {previewLink}
        </div>

        {isPreviewOpen && (
          <GeoJSONPreviewPanel
            geometry={geometry}
            onEdit={() => setIsRawMode(true)}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-100 p-2">{children}</div>
    </>
  )
}
