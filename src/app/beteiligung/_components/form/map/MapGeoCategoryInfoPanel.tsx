import type { GeoCategoryMapProps } from "@/src/app/beteiligung/_components/form/map/GeoCategoryMap"
import { SurveyMapPanelContainer } from "@/src/app/beteiligung/_components/form/map/MapPanelContainer"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { isProduction } from "@/src/core/utils"

type Props = {
  description?: GeoCategoryMapProps["description"]
  infoPanelText?: GeoCategoryMapProps["infoPanelText"]
  additionalData: GeoCategoryMapProps["additionalData"]
  geoCategoryIdDefinition: GeoCategoryMapProps["geoCategoryIdDefinition"]
}

export const SurveyMapGeoCategoryInfoPanel = ({
  description,
  infoPanelText,
  additionalData,
  geoCategoryIdDefinition,
}: Props) => {
  const field = useFieldContext<object>()

  // Use infoPanelText if provided, otherwise use description, otherwise use default text
  const displayText = infoPanelText || description || "Bitte treffen Sie eine Auswahl."

  return (
    <>
      {field.form.getFieldValue(geoCategoryIdDefinition.dataKey) ? (
        <SurveyMapPanelContainer>
          <ul className="text-left">
            {!isProduction && (
              <li className="font-mono">
                <small>
                  <strong>ID:</strong>{" "}
                  {field.form.getFieldValue(geoCategoryIdDefinition.dataKey) || "Keine Auswahl"} (
                  {geoCategoryIdDefinition.propertyName})
                </small>
              </li>
            )}
            {additionalData.map((data) => {
              const { label, dataKey, propertyName } = data
              const value = field.form.getFieldValue(dataKey)

              // Check if value is a stringified array and parse it
              let displayValue: string
              try {
                const parsedValue = JSON.parse(value)
                displayValue = Array.isArray(parsedValue) ? parsedValue.join(", ") : value
              } catch {
                displayValue = value
              }
              displayValue = displayValue || "Keine Auswahl"

              return (
                <li key={dataKey} className="text-black">
                  <strong>{label}: </strong>
                  {displayValue}{" "}
                  {!isProduction && <small className="font-mono">({propertyName})</small>}
                </li>
              )
            })}
          </ul>
        </SurveyMapPanelContainer>
      ) : (
        <SurveyMapPanelContainer>{displayText}</SurveyMapPanelContainer>
      )}
    </>
  )
}
