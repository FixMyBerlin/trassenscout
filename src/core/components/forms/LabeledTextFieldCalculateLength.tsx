import { length, lineString } from "@turf/turf"
import { clsx } from "clsx"
import { useFormContext } from "react-hook-form"
import { blueButtonStyles } from "../links"
import { LabeledTextField, LabeledTextFieldProps } from "./LabeledTextField"

export const LabeledTextFieldCalculateLength: React.FC<LabeledTextFieldProps> = (props) => {
  const { watch, setValue, getValues } = useFormContext()

  const geometryType = watch("type") || "LINE"

  function isPoint(geometry: any) {
    // Check if it's a Point or MultiPoint GeoJSON geometry
    if (geometry?.type === "Point" || geometry?.type === "MultiPoint") return true
    // Backward compatibility: check if it's just coordinates array [number, number]
    return (
      Array.isArray(geometry) &&
      geometry.length === 2 &&
      typeof geometry[0] === "number" &&
      typeof geometry[1] === "number"
    )
  }

  const calculateLength = () => {
    const geometry = getValues("geometry")
    let calculatedLength = null

    if (geometry && geometry.type) {
      // Handle GeoJSON geometry objects with type property
      switch (geometry.type) {
        case "LineString":
          calculatedLength = Number(
            (length(lineString(geometry.coordinates), { units: "kilometers" }) * 1000).toFixed(0),
          )
          break
        case "MultiLineString":
          // Sum length of all lines in MultiLineString
          calculatedLength = Number(
            geometry.coordinates
              .reduce((acc: number, coords: number[][]) => {
                return acc + length(lineString(coords), { units: "kilometers" }) * 1000
              }, 0)
              .toFixed(0),
          )
          break
        case "Point":
        case "MultiPoint":
        case "Polygon":
        case "MultiPolygon":
          // For points and polygons, return 0 - length calculation not applicable
          calculatedLength = null
          break
        default:
          // Unknown geometry type - return 0
          calculatedLength = null
      }
    }

    setValue(props.name, calculatedLength)
  }

  let helpText: string

  if (props.readOnly) {
    helpText =
      "Dieser Wert wird aus den Geometrien (Placemark) berechnet und kann nicht manuell editiert werden."
  } else if (!getValues("geometry")) {
    helpText = "Es ist keine Geometrie vorhanden"
  } else if (isPoint(getValues("geometry")) || geometryType === "POINT") {
    helpText =
      "Die Geometrie ist ein Punkt. Die Länge kann nicht berechnet, sondern nur manuell eingetragen werden. "
  } else if (geometryType === "POLYGON") {
    helpText =
      "Dieser Wert kann manuell eingetragen oder als Umfang (Perimeter) aus den vorhandenen Polygon-Geometrien berechnet werden."
  } else {
    helpText =
      "Dieser Wert kann manuell eingetragen oder aus den vorhandenen Geometrien berechnet werden."
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <LabeledTextField inlineLeadingAddon="m" type="number" step="1" {...props} help={helpText} />

      <button
        type="button"
        disabled={props.readOnly}
        onClick={calculateLength}
        className={clsx(blueButtonStyles, "px-2! py-1!")}
      >
        {geometryType === "LINE" ? "Länge aus Geometrie ermitteln" : "Länge zurücksetzen"}
      </button>
    </div>
  )
}
