"use client"

import { TextField, type TextFieldProps } from "@/src/core/components/forms/fields/TextField"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { GeometryTypeEnum } from "@prisma/client"
import { length } from "@turf/turf"
import { clsx } from "clsx"
import { blueButtonStyles } from "../../links"
import { lineStringToGeoJSON } from "../../Map/utils/lineStringToGeoJSON"

export function TextFieldCalculateLength({
  readOnly,
  ...rest
}: Omit<TextFieldProps, "type" | "inlineLeadingAddon" | "step">) {
  const field = useFieldContext<string>()
  const geometryType =
    (field.form.getFieldValue("type") as GeometryTypeEnum | undefined) || GeometryTypeEnum.LINE

  const calculateLength = () => {
    const geo = field.form.getFieldValue("geometry") as SupportedGeometry | undefined
    if (!geo) return
    if (geo.type !== "LineString" && geo.type !== "MultiLineString") return

    const lineFeatures = lineStringToGeoJSON(geo)
    const totalMeters = lineFeatures.reduce((acc, feature) => {
      return acc + length(feature, { units: "meters" })
    }, 0)
    field.handleChange(String(Math.round(totalMeters)))
  }

  const helpText = readOnly
    ? "Dieser Wert wird aus den Geometrien (Placemark) berechnet und kann nicht manuell editiert werden."
    : "Die Länge der Maßnahme in Metern."

  const showCalculateButton = geometryType === "LINE" && !readOnly

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <TextField
        inlineLeadingAddon="m"
        type="number"
        step="1"
        readOnly={readOnly}
        {...rest}
        help={helpText}
      />

      {showCalculateButton && (
        <button
          type="button"
          onClick={calculateLength}
          className={clsx(blueButtonStyles, "px-2! py-1!")}
        >
          Länge aus Geometrie ermitteln
        </button>
      )}
    </div>
  )
}
