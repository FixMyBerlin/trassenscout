import { GeoJSONPreviewLink, GeoJSONPreviewPanel } from "@/src/core/components/forms/GeoJSONPreview"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import type { FormApi } from "@/src/core/components/forms/types"
import type { Geometry } from "geojson"
import { ReactNode, useState } from "react"

type GeometryInputBaseProps = {
  form: FormApi<Record<string, unknown>>
  label: string
  description?: ReactNode
  children: ReactNode
  allowedGeometryTypesFor?: "subsection" | "subsubsection"
}

function GeometryInputBody({
  form,
  label,
  description,
  children,
  allowedGeometryTypesFor,
  geometry,
}: Omit<GeometryInputBaseProps, "form"> & {
  form: FormApi<Record<string, unknown>>
  geometry: Geometry | undefined
}) {
  const [isRawMode, setIsRawMode] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  if (isRawMode) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        <div className="rounded-md border border-gray-200 bg-gray-100 p-2">
          <LabeledGeometryField
            form={form}
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

export const GeometryInputBase = ({
  form,
  label,
  description,
  children,
  allowedGeometryTypesFor,
}: GeometryInputBaseProps) => {
  return (
    <form.Subscribe selector={(s) => s.values.geometry as Geometry | undefined}>
      {(geometry) => (
        <GeometryInputBody
          form={form}
          label={label}
          description={description}
          allowedGeometryTypesFor={allowedGeometryTypesFor}
          geometry={geometry}
        >
          {children}
        </GeometryInputBody>
      )}
    </form.Subscribe>
  )
}
