import { SurveyScreenHeader } from "@/src/survey-public/components/core/layout/SurveyScreenHeader"
import type { TPage } from "@/src/survey-public/components/types"
import { useFormContext } from "react-hook-form"
import { getQuestionNames } from "../utils/getQuestionNames"
import { Question } from "./Question"
import { SurveyP } from "./core/Text"
import { SurveyButtonWithAction } from "./core/buttons/SurveyButtonWithAction"
import { SurveyButtonWrapper } from "./core/buttons/SurveyButtonWrapper"
import { SurveyFormErrorsBox } from "./core/form/SurveyFormErrorsBox"

type Props = {
  page: TPage
  buttonActions: any
}

export const Page = ({ page, buttonActions }: Props) => {
  const {
    formState: { errors },
  } = useFormContext()

  if (!page) return null
  const { id: pageId, title, description, questions, buttons } = page

  const relevantQuestionNames = getQuestionNames(questions!)

  return (
    <section>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {questions &&
        questions.length &&
        questions.map((question) => (
          <Question className="mb-2" key={`${pageId}-${question.id}`} question={question} />
        ))}
      <SurveyFormErrorsBox formErrors={errors} surveyPart="survey" />
      <SurveyButtonWrapper>
        {buttons?.map((button) => {
          return (
            <SurveyButtonWithAction
              key={`${pageId}-${button.label.de}`}
              buttonActions={buttonActions}
              relevantQuestionNames={relevantQuestionNames!}
              button={button}
            />
          )
        })}
      </SurveyButtonWrapper>
      {/* // todo validation */}
      <SurveyP className="text-sm sm:text-sm">
        * Pflichtfelder <br />
        Um fortzufahren, bitte alle Pflichtfelder ausfüllen.
      </SurveyP>
    </section>
  )
}
