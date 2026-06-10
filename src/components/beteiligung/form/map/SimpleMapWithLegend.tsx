import clsx from "clsx"
import { ComponentProps } from "react"
import { MapProvider } from "react-map-gl/maplibre"
import { FieldError } from "@/src/components/beteiligung/form/FieldErrror"
import { SurveyMapLegend } from "@/src/components/beteiligung/form/map/MapLegend"
import { SurveySimpleMap } from "@/src/components/beteiligung/form/map/SimpleMap"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type Props = {
  label: string
  description?: string
  mapProps: ComponentProps<typeof SurveySimpleMap>
  legendProps: ComponentProps<typeof SurveyMapLegend>
}

export const SurveySimpleMapWithLegend = ({ mapProps, legendProps, label, description }: Props) => {
  const field = useFieldContext<object>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <MapProvider>
      <div className={clsx("mt-8 mb-24 w-full p-2", hasError && "rounded-sm bg-red-50")}>
        <p className={formClasses.fieldLabel}>{label}</p>
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
        <SurveySimpleMap {...mapProps} />
        <SurveyMapLegend {...legendProps} />
        <FieldError field={field} />
      </div>
    </MapProvider>
  )
}
