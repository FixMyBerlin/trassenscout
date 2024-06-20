import { SurveyButton } from "./core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "./core/buttons/SurveyButtonWrapper"

type Props = { onStartClick: () => void; startContent: React.ReactNode; disabled: boolean }

export const Start: React.FC<Props> = ({ onStartClick, startContent, disabled }) => {
  return (
    <div>
      {startContent}
      {disabled && (
        <small className="text-red-500">
          Fehler: Die URL ist fehlerhaft oder unvollständig. Bitte überprüfen Sie den Link, den Sie
          erhalten haben.
        </small>
      )}
      <SurveyButtonWrapper>
        <SurveyButton disabled={disabled} onClick={onStartClick}>
          Beteiligung starten
        </SurveyButton>
      </SurveyButtonWrapper>
    </div>
  )
}
