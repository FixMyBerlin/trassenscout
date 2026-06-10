import { SurveyMapPanelContainer } from "@/src/components/beteiligung/form/map/MapPanelContainer"

type Props = {
  status: "default" | "pinOutOfView"
  action?: () => void
}

export const SurveyMapOutOfViewPanel = ({ status, action }: Props) => {
  switch (status) {
    case "default":
      return (
        <SurveyMapPanelContainer>
          Bewegen Sie den Pin auf die gewünschte Position.
        </SurveyMapPanelContainer>
      )
    case "pinOutOfView":
      return (
        <SurveyMapPanelContainer>
          Pin liegt außerhalb der aktuellen Ansicht.{" "}
          <button
            className="text-(--survey-primary-color) hover:underline"
            onClick={action}
            type="button"
          >
            Zentrieren
          </button>
        </SurveyMapPanelContainer>
      )
  }
}
