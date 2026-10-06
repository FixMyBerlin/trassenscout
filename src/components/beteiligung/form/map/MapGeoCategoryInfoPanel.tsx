import { useStore } from "@tanstack/react-form"
import type { GeoCategoryMapProps } from "@/src/components/beteiligung/form/map/GeoCategoryMap"
import { SurveyMapPanelContainer } from "@/src/components/beteiligung/form/map/MapPanelContainer"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"

type Props = {
  description?: GeoCategoryMapProps["description"]
  infoPanelText?: GeoCategoryMapProps["infoPanelText"]
  additionalData: GeoCategoryMapProps["additionalData"]
  geoCategoryIdDefinition: GeoCategoryMapProps["geoCategoryIdDefinition"]
}

const sameValues = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((value, index) => value === b[index])

const toDisplayValue = (value: unknown) => {
  try {
    const parsed = JSON.parse(value as string)
    if (Array.isArray(parsed)) return parsed.join(", ") || "Keine Auswahl"
  } catch {
    // not JSON: shown as is
  }
  return (value as string | undefined) || "Keine Auswahl"
}

export const SurveyMapGeoCategoryInfoPanel = ({
  description,
  infoPanelText,
  additionalData,
  geoCategoryIdDefinition,
}: Props) => {
  const field = useFieldContext<object>()
  // Subscribed, not read via getFieldValue: the compiler memoizes this panel, so a read never refreshes.
  const geoCategoryId = useStore(
    field.form.store,
    (state) => state.values[geoCategoryIdDefinition.dataKey],
  )
  const additionalValues = useStore(
    field.form.store,
    (state) => additionalData.map(({ dataKey }) => state.values[dataKey]),
    sameValues,
  )

  if (!geoCategoryId) {
    return (
      <SurveyMapPanelContainer>
        {infoPanelText || description || "Bitte treffen Sie eine Auswahl."}
      </SurveyMapPanelContainer>
    )
  }

  return (
    <SurveyMapPanelContainer>
      <SuperAdminBox>
        <ul className="text-left">
          <li>
            <strong>ID:</strong> {geoCategoryId} ({geoCategoryIdDefinition.propertyName})
          </li>
          {additionalData.map(({ label, dataKey, propertyName }, index) => (
            <li key={dataKey} className="text-black">
              <strong>{label}: </strong>
              {toDisplayValue(additionalValues[index])} ({propertyName})
            </li>
          ))}
        </ul>
      </SuperAdminBox>
      <ul className="text-left">
        {additionalData.map(({ label, dataKey }, index) => (
          <li key={dataKey} className="text-black">
            <strong>{label}: </strong>
            {toDisplayValue(additionalValues[index])}
          </li>
        ))}
      </ul>
    </SurveyMapPanelContainer>
  )
}
