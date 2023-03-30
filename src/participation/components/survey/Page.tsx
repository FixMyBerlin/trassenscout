import { ScreenHeaderParticipation } from "src/participation/components/core/ScreenHeaderParticipation"
import { SurveyButton } from "./SurveyButton"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"
import { Page as TPage } from "src/participation/data/types"
import { Question } from "./Question"
export { FORM_ERROR } from "src/core/components/forms"

// export type TSurveyButton = {
//   label: { de: string }
//   color: "white" | "pink"
//   onClick: { action: "nextPage" | "previousPage" | "submit" }
// }

// export type TQuestion = {
//   id: number
//   label: { de: string }
//   component: "singleResponse" | "multipleResponse" | "text"
//   props: {
//     responses: TResponse[]
//   }
// }

type Props = { page: TPage; buttonActions: any; completed: boolean }

export const Page: React.FC<Props> = ({ page, buttonActions, completed }) => {
  if (!page) return null
  const { title, description, questions, buttons } = page
  return (
    <section>
      <>
        <ScreenHeaderParticipation title={title.de} description={description.de} />
        {questions &&
          questions.length &&
          questions.map((question, index) => (
            // eslint-disable-next-line react/jsx-key
            <Question className="mb-2" key={index} question={question} />
          ))}
        <ParticipationButtonWrapper>
          {buttons?.map((button, index) => {
            let disabled = false
            if (["nextPage", "submit"].includes(button.onClick.action)) {
              disabled = !completed
            }
            return (
              <SurveyButton
                buttonActions={buttonActions}
                key={index}
                button={button}
                disabled={disabled}
              />
            )
          })}
        </ParticipationButtonWrapper>
      </>
    </section>
  )
}
