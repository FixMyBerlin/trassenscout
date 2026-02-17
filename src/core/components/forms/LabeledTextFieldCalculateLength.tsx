import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { length } from "@turf/turf"
import { clsx } from "clsx"
import { useFormContext } from "react-hook-form"
import { blueButtonStyles } from "../links"
import { lineStringToGeoJSON } from "../Map/utils/lineStringToGeoJSON"
import { LabeledTextField, LabeledTextFieldProps } from "./LabeledTextField"

export function LabeledTextFieldCalculateLength({
  name,
  readOnly,
  ...rest
}: LabeledTextFieldProps) {
  const { watch, setValue, getValues } = useFormContext()

  const geometryType = watch("type") || "LINE"

  const calculateLength = () => {
    const geo = getValues("geometry") as SupportedGeometry | undefined
    if (!geo) return
    if (geo.type !== "LineString" && geo.type !== "MultiLineString") return

    const lineFeatures = lineStringToGeoJSON(geo)
    const totalMeters = lineFeatures.reduce((acc, feature) => {
      return acc + length(feature, { units: "meters" })
    }, 0)
    setValue(name, Math.round(totalMeters))
  }

  const helpText = readOnly
    ? "Dieser Wert wird aus den Geometrien (Placemark) berechnet und kann nicht manuell editiert werden."
    : "Die Länge der Maßnahme in Metern."

  const showCalculateButton = geometryType === "LINE" && !readOnly

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <LabeledTextField
        inlineLeadingAddon="m"
        type="number"
        step="1"
        name={name}
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
