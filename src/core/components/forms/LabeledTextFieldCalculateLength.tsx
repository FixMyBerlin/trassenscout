import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { length } from "@turf/turf"
import { clsx } from "clsx"
import type { FormApi } from "@/src/core/components/forms/types"
import { blueButtonStyles } from "../links"
import { lineStringToGeoJSON } from "../Map/utils/lineStringToGeoJSON"
import { LabeledTextField, LabeledTextFieldProps } from "./LabeledTextField"

type Props = Omit<LabeledTextFieldProps, "form"> & {
  form: FormApi<Record<string, unknown>>
}

export function LabeledTextFieldCalculateLength({ form, name, readOnly, ...rest }: Props) {
  return (
    <form.Subscribe
      selector={(s) => ({
        geometryType: s.values.type || "LINE",
        geo: s.values.geometry as SupportedGeometry | undefined,
      })}
    >
      {({ geometryType, geo }) => {
        const calculateLength = () => {
          if (!geo) return
          if (geo.type !== "LineString" && geo.type !== "MultiLineString") return

          const lineFeatures = lineStringToGeoJSON(geo)
          const totalMeters = lineFeatures.reduce((acc, feature) => {
            return acc + length(feature, { units: "meters" })
          }, 0)
          form.setFieldValue(name as never, Math.round(totalMeters) as never)
        }

        const helpText = readOnly
          ? "Dieser Wert wird aus den Geometrien (Placemark) berechnet und kann nicht manuell editiert werden."
          : "Die Länge der Maßnahme in Metern."

        const showCalculateButton = geometryType === "LINE" && !readOnly

        return (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <LabeledTextField
              form={form}
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
      }}
    </form.Subscribe>
  )
}
