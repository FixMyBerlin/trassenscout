import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import type { TPage } from "src/survey-public/components/types"
import { Question } from "./Question"
import { SurveyP } from "./core/Text"
import { SurveyButtonWithAction } from "./core/buttons/SurveyButtonWithAction"
import { SurveyButtonWrapper } from "./core/buttons/SurveyButtonWrapper"
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
      <SurveyScreenHeader title={title.de} description={description.de} />
      {questions &&
        questions.length &&
        questions.map((question) => (
          <Question className="mb-2" key={`${pageId}-${question.id}`} question={question} />
        ))}
      <SurveyButtonWrapper>
        {buttons?.map((button) => {
          let disabled = false
          if (["nextPage", "submit"].includes(button.onClick.action)) {
            disabled = !completed
          }
          return (
            <SurveyButtonWithAction
              key={`${pageId}-${button.label.de}`}
              buttonActions={buttonActions}
              button={button}
              disabled={disabled}
            />
          )
        })}
      </SurveyButtonWrapper>
      <SurveyP className="text-sm sm:text-sm">
        * Pflichtfelder <br />
        Um fortzufahren, bitte alle Pflichtfelder ausfüllen.
      </SurveyP>
    </section>
  )
}
