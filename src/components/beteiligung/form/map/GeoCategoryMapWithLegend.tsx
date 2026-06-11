import { ComponentProps } from "react"
import { MapProvider } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { FieldError } from "@/src/components/beteiligung/form/FieldErrror"
import { SurveyGeoCategoryMap } from "@/src/components/beteiligung/form/map/GeoCategoryMap"
import { SurveyMapLegend } from "@/src/components/beteiligung/form/map/MapLegend"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type Props = {
  label: string
  description?: string
  mapProps: ComponentProps<typeof SurveyGeoCategoryMap>
  legendProps: ComponentProps<typeof SurveyMapLegend>
}

export const SurveyGeoCategoryMapWithLegend = ({
  mapProps,
  legendProps,
  label,
  description,
}: Props) => {
  const field = useFieldContext<object>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <MapProvider>
      <div className={twJoin("mt-8 mb-12 w-full p-2", hasError ? "rounded-sm bg-red-50" : "")}>
        <p className={formClasses.fieldLabel}>{label}</p>
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
        <SurveyGeoCategoryMap description={description} {...mapProps} />
        <SurveyMapLegend {...legendProps} />
        <FieldError field={field} />
      </div>
    </MapProvider>
  )
}
