import { ErrorMessage } from "@hookform/error-message"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { LabeledGeometryFieldPreview } from "./LabeledGeometryFieldPreview"
import { extractGeometryFromGeoJSON } from "./_utils/extractGeometryFromGeoJSON"

export interface LabeledTextareaProps extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
}

export const LabeledGeometryField = forwardRef<HTMLTextAreaElement, LabeledTextareaProps>(
  function LabeledGeometryField(
    { name, label, help, outerProps, labelProps, optional, className: textareaClasName, ...props },
    ref,
  ) {
    const {
      register,
      formState: { isSubmitting, errors },
      setValue,
      watch,
    } = useFormContext()

    const geometryType = watch("type") || "LINE" // Subsections don't have a `type` but are LINE
    const value = watch(name)
    const [valueString, setValueString] = useState("")
    useEffect(() => {
      setValueString(JSON.stringify(value, undefined, 2))
    }, [value])

    const [hasJsonParseError, setJsonParseError] = useState(false)
    const hasError = Boolean(errors[name])

    // Handle paste event for GeoJSON
    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = event.clipboardData.getData("text")
      if (!pastedText.trim()) return

      const extracted = extractGeometryFromGeoJSON(pastedText)
      if (!extracted) {
        // Not valid GeoJSON or doesn't match expected format, allow normal paste
        return
      }

      // Validate geometry type matches form selection
      let isValid = false
      if (
        geometryType === "POINT" &&
        (extracted.geometryType === "Point" || extracted.geometryType === "MultiPoint")
      ) {
        isValid = true
      } else if (
        geometryType === "LINE" &&
        (extracted.geometryType === "LineString" || extracted.geometryType === "MultiLineString")
      ) {
        isValid = true
      } else if (
        geometryType === "POLYGON" &&
        (extracted.geometryType === "Polygon" || extracted.geometryType === "MultiPolygon")
      ) {
        isValid = true
      }

      if (!isValid) {
        event.preventDefault()
        setJsonParseError(true)
        return
      }

      // Prevent default paste and update form value with full GeoJSON geometry
      event.preventDefault()
      setValue(name, extracted.geometry, { shouldValidate: true })
      setJsonParseError(false)
      // valueString will be updated by useEffect when value changes
    }

    // Convert the JSON value to a string
    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = undefined
      try {
        newValue = JSON.parse(event.target.value)
        setJsonParseError(false)
      } catch (error) {
        setJsonParseError(true)
        console.error("ERROR in LabeledGeometryField", error, JSON.stringify(event.target.value))
      }

      newValue && setValue(name, newValue, { shouldValidate: true })
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
              disabled={isSubmitting}
              {...register(name)}
              id={name}
              {...props}
              value={valueString}
              onFocus={handleTextareaChange}
              onChange={handleTextareaChange}
              onBlur={handleTextareaChange}
              onSubmit={handleTextareaChange}
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
            <ErrorMessage
              render={({ message }) => (
                <div role="alert" className="text-sm text-red-800">
                  {message}
                </div>
              )}
              errors={errors}
              name={name}
            />
            {hasJsonParseError && (
              <div role="alert" className="mb-3 rounded bg-red-800 p-3 text-sm text-white">
                Es ist ein Fehler beim Verarbeiten der Geometrie aufgetreten. Die Änderung wurde
                daher verworfen. Es könnte sein, dass ein Syntaxfehler vorlag, bspw. durch ein Komma
                zu viel/wenig.
              </div>
            )}
            <LabeledGeometryFieldPreview name={name} hasError={hasJsonParseError || hasError} />
          </div>
        </div>
      </div>
    )
  },
)
