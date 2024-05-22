import { SurveyButton } from "./core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "./core/buttons/SurveyButtonWrapper"

type Props = { onStartClick: () => void; startContent: React.ReactNode }

export const Start: React.FC<Props> = ({ onStartClick, startContent }) => {
  return (
    <div>
      {startContent}
      <SurveyButtonWrapper>
        <SurveyButton onClick={onStartClick}>Beteiligung starten</SurveyButton>
      </SurveyButtonWrapper>
    </div>
  )
}
