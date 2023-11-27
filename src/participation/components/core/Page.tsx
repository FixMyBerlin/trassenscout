import { ScreenHeaderParticipation } from "src/participation/components/core/layout/ScreenHeaderParticipation"
import { ParticipationButtonWithAction } from "./buttons/ParticipationButtonWithAction"
import { ParticipationButtonWrapper } from "./buttons/ParticipationButtonWrapper"
import type { Page as TPage } from "src/participation/data/types"
import { Question } from "./Question"
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
            <ParticipationButtonWithAction
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
