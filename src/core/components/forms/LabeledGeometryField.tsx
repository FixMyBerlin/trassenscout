import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPolygonGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import { SupportedGeometrySchema } from "@/src/server/shared/utils/geometrySchemas"
import { mapGeoTypeToEnum } from "@/src/server/shared/utils/mapGeoTypeToEnum"
import type { FormApi } from "@/src/core/components/forms/types"
import { formatFormError } from "@/src/core/components/forms/formatFormError"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef, useEffect, useState } from "react"
import { z } from "zod"
import { LabeledGeometryFieldPreview } from "./LabeledGeometryFieldPreview"
import { extractGeometryFromGeoJSON } from "./_utils/extractGeometryFromGeoJSON"

export interface LabeledGeometryFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  form: FormApi<Record<string, unknown>>
  name: string
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  allowedGeometryTypesFor?: "subsection" | "subsubsection"
}

const SubsectionGeometrySchema = z.union([
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
])

function LabeledGeometryFieldBody({
  form,
  name,
  label,
  help,
  outerProps,
  labelProps,
  optional,
  allowedGeometryTypesFor,
  textareaClasName,
  props,
  geoField,
  typeVal,
}: {
  form: FormApi<Record<string, unknown>>
  name: string
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  allowedGeometryTypesFor?: "subsection" | "subsubsection"
  textareaClasName?: string
  props: PropsWithoutRef<JSX.IntrinsicElements["textarea"]>
  geoField: {
    state: { value: unknown; meta: { errors: unknown[] } }
    handleChange: (v: never) => void
  }
  typeVal: unknown
}) {
  const geometryType = (typeVal as string) || "LINE"
  const value = geoField.state.value
  const [valueString, setValueString] = useState("")
  useEffect(() => {
    setValueString(JSON.stringify(value, undefined, 2))
  }, [value])

  const [hasJsonParseError, setJsonParseError] = useState(false)
  const hasError = geoField.state.meta.errors.length > 0
  const allowedGeometrySchema =
    allowedGeometryTypesFor === "subsection" ? SubsectionGeometrySchema : SupportedGeometrySchema

  const setGeom = (g: unknown) => {
    geoField.handleChange(g as never)
  }
  const setType = (t: unknown) => {
    form.setFieldValue("type" as never, t as never)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("text")
    if (!pastedText.trim()) return

    try {
      const extracted = extractGeometryFromGeoJSON(pastedText)
      if (!extracted) return

      const parseResult = allowedGeometrySchema.safeParse(extracted.geometry)

      if (!parseResult.success) {
        event.preventDefault()
        setJsonParseError(true)
        console.error("ERROR in LabeledGeometryField: Invalid geometry schema", parseResult.error)
        return
      }

      event.preventDefault()
      setJsonParseError(false)
      setGeom(parseResult.data)
      if (parseResult.data.type) {
        setType(mapGeoTypeToEnum(parseResult.data.type))
      }
    } catch (error) {
      setJsonParseError(true)
      console.error("ERROR in LabeledGeometryField: Paste error", error)
    }
  }

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textValue = event.target.value.trim()

    if (!textValue) {
      setJsonParseError(false)
      return
    }

    try {
      const parsedJson = JSON.parse(textValue)
      const parseResult = allowedGeometrySchema.safeParse(parsedJson)

      if (!parseResult.success) {
        setJsonParseError(true)
        console.error("ERROR in LabeledGeometryField: Invalid geometry schema", parseResult.error)
        return
      }

      setJsonParseError(false)
      setGeom(parseResult.data)
      const geoType = parseResult.data.type
      if (geoType) {
        setType(mapGeoTypeToEnum(geoType))
      }
    } catch (error) {
      setJsonParseError(true)
      console.error("ERROR in LabeledGeometryField", error, JSON.stringify(event.target.value))
    }
  }

  return (
    <div {...outerProps}>
      <label
        {...labelProps}
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
        {optional && <> (optional)</>}
      </label>
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col">
          <textarea
            disabled={form.state.isSubmitting}
            id={name}
            {...props}
            value={valueString}
            onChange={handleTextareaChange}
            onBlur={handleTextareaChange}
            onPaste={handlePaste}
            className={clsx(
              textareaClasName,
              "block w-full grow rounded-md font-mono text-xs shadow-sm",
              hasError
                ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            )}
          />
          {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
          <p className="mt-2 text-sm text-gray-500">
            Das richtige Koordinatensystem ist EPSG:4326 / WGS84.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {geometryType === "POINT" ? (
              <>
                Das richtige Format für einen Punkt ist{" "}
                <code>{JSON.stringify({ type: "Point", coordinates: [9.1943, 48.8932] })}</code>.
                Unterstützt auch MultiPoint.
              </>
            ) : geometryType === "LINE" ? (
              <>
                Das richtige Format für eine Linie ist{" "}
                <code>
                  {JSON.stringify({
                    type: "LineString",
                    coordinates: [
                      [9.1943, 48.8932],
                      [9.2043, 48.8933],
                    ],
                  })}
                </code>
                . Unterstützt auch MultiLineString.
              </>
            ) : geometryType === "POLYGON" ? (
              <>
                Das richtige Format für ein Polygon ist{" "}
                <code>
                  {JSON.stringify({
                    type: "Polygon",
                    coordinates: [
                      [
                        [9.1943, 48.8932],
                        [9.2043, 48.8933],
                        [9.2143, 48.8943],
                        [9.1943, 48.8932],
                      ],
                    ],
                  })}
                </code>
                . Unterstützt auch MultiPolygon.
              </>
            ) : (
              <>Bitte wählen Sie einen Geometrietyp aus.</>
            )}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Es kann eine GeoJSON Feature in das Eingabefeld kopiert (strg+v) werden.
          </p>
        </div>
        <div>
          {hasError && (
            <div role="alert" className="text-sm text-red-800">
              {geoField.state.meta.errors.map((err) => formatFormError(err)).join(", ")}
            </div>
          )}
          {hasJsonParseError && (
            <div role="alert" className="mb-3 rounded bg-red-800 p-3 text-sm text-white">
              Es ist ein Fehler beim Verarbeiten der Geometrie aufgetreten. Die Änderung wurde
              daher verworfen. Es könnte sein, dass ein Syntaxfehler vorlag, bspw. durch ein Komma
              zu viel/wenig.
            </div>
          )}
          <LabeledGeometryFieldPreview
            form={form}
            name={name}
            hasError={hasJsonParseError || hasError}
          />
        </div>
      </div>
    </div>
  )
}

export const LabeledGeometryField = forwardRef<HTMLTextAreaElement, LabeledGeometryFieldProps>(
  function LabeledGeometryField(
    {
      form,
      name,
      label,
      help,
      outerProps,
      labelProps,
      optional,
      allowedGeometryTypesFor,
      className: textareaClasName,
      ...props
    },
    _ref,
  ) {
    return (
      <form.Field name={name}>
        {(geoField) => (
          <form.Subscribe selector={(s) => s.values.type}>
            {(typeVal) => (
              <LabeledGeometryFieldBody
                form={form}
                name={name}
                label={label}
                help={help}
                outerProps={outerProps}
                labelProps={labelProps}
                optional={optional}
                allowedGeometryTypesFor={allowedGeometryTypesFor}
                textareaClasName={textareaClasName}
                props={props}
                geoField={geoField}
                typeVal={typeVal}
              />
            )}
          </form.Subscribe>
        )}
      </form.Field>
    )
  },
)
