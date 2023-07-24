import { ParticipationButtonWrapper } from "../core/buttons/ParticipationButtonWrapper"
import { SurveyButton } from "./SurveyButton"
import { Question } from "./Question"
import { ScreenHeaderParticipation } from "src/participation/components/layout/ScreenHeaderParticipation"
import type { Page as TPage } from "src/participation/data/types"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: TPage
  buttonActions: any
  completed: boolean
}

export const Page: React.FC<Props> = ({ page, buttonActions, completed }) => {
  if (!page) return null
  const { id: pageId, title, description, questions, buttons } = page

  return (
    <section>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      {questions &&
        questions.length &&
        questions.map((question) => (
          <Question className="mb-2" key={`${pageId}-${question.id}`} question={question} />
        ))}
      <ParticipationButtonWrapper>
        {buttons?.map((button) => {
          let disabled = false
          if (["nextPage", "submit"].includes(button.onClick.action)) {
            disabled = !completed
          }
          return (
            <SurveyButton
              key={`${pageId}-${button.label.de}`}
              buttonActions={buttonActions}
              button={button}
              disabled={disabled}
            />
          )
        })}
      </ParticipationButtonWrapper>
    </section>
  )
}
