import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { SurveyGeoCategoryMap } from "@/src/app/beteiligung/_components/form/map/GeoCategoryMap"
import { SurveyMapLegend } from "@/src/app/beteiligung/_components/form/map/MapLegend"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import clsx from "clsx"
import { ComponentProps } from "react"
import { MapProvider } from "react-map-gl/maplibre"

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
      <div className={clsx("mb-12 mt-8 w-full p-2", hasError && "rounded bg-red-50")}>
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
