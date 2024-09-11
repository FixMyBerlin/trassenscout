import { length, lineString } from "@turf/turf"
import clsx from "clsx"
import { useFormContext } from "react-hook-form"
import { blueButtonStyles } from "../links"
import { LabeledFormatNumberField, LabeledFormatNumberFieldProps } from "./LabeledFormatNumberField"

export const LabeledFormatNumberFieldCalculateLength: React.FC<LabeledFormatNumberFieldProps> = (
  props,
) => {
  const { watch, setValue, getValues } = useFormContext()

  const isGeometry = watch("geometry")

  function isPoint(geometry: any[]) {
    return (
      geometry?.length === 2 && typeof geometry[0] === "number" && typeof geometry[1] === "number"
    )
  }

  const calculateLength = () => {
    const geometry = getValues("geometry")
    const calculatedLength = Number(length(lineString(geometry)).toFixed(3))
    setValue(props.name, calculatedLength)
  }

  let helpText: string

  if (props.readOnly) {
    helpText =
      "Dieser Wert wird aus den Geometrien (Felt) berechnet und kann nicht manuell editiert werden."
  } else if (!getValues("geometry")) {
    helpText = "Es ist keine Geometrie vorhanden"
  } else if (isPoint(getValues("geometry"))) {
    helpText =
      "Die Geometrie ist ein Punkt. Die Länge kann nicht berechnet, sondern nur manuell eingetragen werden. "
  } else {
    helpText =
      "Dieser Wert kann manuell eingetragen oder aus den vorhandenen Geometrien berechnet werden."
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <LabeledFormatNumberField
        inlineLeadingAddon="km"
        maxDecimalDigits={3}
        step="0.001"
        {...props}
        help={helpText}
      />

      <button
        type="button"
        disabled={!isGeometry || isPoint(getValues("geometry")) || props.readOnly}
        onClick={calculateLength}
        className={clsx(blueButtonStyles, "!px-2 !py-1")}
      >
        Länge aus Geometrie berechnen
      </button>
    </div>
  )
}
