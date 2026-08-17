import type { Geometry } from "geojson"
import { ReactNode, useState } from "react"
import { twJoin } from "tailwind-merge"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import {
  GeoJSONPreviewLink,
  GeoJSONPreviewPanel,
} from "@/src/components/core/components/forms/GeoJSONPreview"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFormFieldErrors } from "@/src/components/core/components/forms/hooks/useFormFieldErrors"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"

type GeometryInputBaseProps = {
  label: string
  description?: ReactNode
  children: ReactNode
  /** Determines which geometry types are allowed. "subsection" allows LineString and Polygon only. "subsubsection" allows all types (Point, LineString, Polygon). */
  allowedGeometryTypesFor?: "subsection" | "subsubsection"
  showPreviewLink?: boolean
  contentContainerClassName?: string
}

export const GeometryInputBase = ({
  label,
  description,
  children,
  allowedGeometryTypesFor,
  showPreviewLink = true,
  contentContainerClassName,
}: GeometryInputBaseProps) => {
  const form = useCoreAppFormContext()
  const geometry = useFormValue<Geometry | undefined>("geometry")
  const geometryErrors = useFormFieldErrors("geometry")

  const [isRawMode, setIsRawMode] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Once in raw mode, stay in raw mode (one-way switch)
  if (isRawMode) {
    return (
      <FieldLayout label={label} help={description} errors={geometryErrors}>
        <div className="rounded-md border border-gray-200 bg-gray-100 p-2">
          <form.AppField name="geometry">
            {(field) => (
              <field.GeometryField
                layout="bare"
                label="GeoJSON Geometrie (`Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, oder `MultiPolygon`)"
                allowedGeometryTypesFor={allowedGeometryTypesFor}
                outerProps={{
                  className: "rounded-sm border border-gray-200 bg-white p-3",
                }}
              />
            )}
          </form.AppField>
        </div>
      </FieldLayout>
    )
  }

  const previewLink = showPreviewLink ? (
    <GeoJSONPreviewLink onOpen={() => setIsPreviewOpen(true)} />
  ) : null

  return (
    <FieldLayout label={label} help={description} errors={geometryErrors}>
      <div
        className={twJoin(
          "rounded-md border border-gray-200 bg-gray-100 p-2",
          contentContainerClassName,
        )}
      >
        {children}
      </div>

      {previewLink && <div className="mt-2">{previewLink}</div>}

      {showPreviewLink && isPreviewOpen && (
        <GeoJSONPreviewPanel
          geometry={geometry}
          onEdit={() => setIsRawMode(true)}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </FieldLayout>
  )
}
