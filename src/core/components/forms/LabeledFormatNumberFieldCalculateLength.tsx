import clsx from "clsx"
import { useFormContext } from "react-hook-form"
import { blueButtonStyles } from "../links"
import { LabeledFormatNumberField, LabeledFormatNumberFieldProps } from "./LabeledFormatNumberField"
import { length, lineString } from "@turf/turf"
export interface LabeledFormatNumberFieldCalculateLengthProps
  extends LabeledFormatNumberFieldProps {
  isCalculateButton?: boolean
}

export const LabeledFormatNumberFieldCalculateLength: React.FC<
  LabeledFormatNumberFieldCalculateLengthProps
> = (props) => {
  const { setValue, getValues } = useFormContext()

  const calculateLength = () => {
    const geometry = getValues("geometry")
    if (!geometry) {
      alert("Keine Geometrie vorhanden")
    } else {
      const calculatedLength = length(lineString(geometry))
      setValue(props.name, calculatedLength)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <LabeledFormatNumberField
        inlineLeadingAddon="km"
        maxDecimalDigits={3}
        step="0.001"
        {...props}
      />
      {props.isCalculateButton && (
        <button
          type="button"
          onClick={calculateLength}
          className={clsx(blueButtonStyles, "!py-1 !px-2")}
        >
          Länge aus Geometrie berechnen
        </button>
      )}
    </div>
  )
}
