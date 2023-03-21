import { ScreenHeaderParticipation } from "src/participation/components/core/ScreenHeaderParticipation"
import { ParticipationButton, TParticipationButton } from "../core/ParticipationButton"
import { Question } from "../Question"
export { FORM_ERROR } from "src/core/components/forms"

export type TButton = {
  label: { de: string }
  color: "white" | "pink"
  onClick: { action: "reset" | "nextPage" | "previousPage" | "submit" }
}

export type TQuestion = {
  id: number
  label: { de: string }
  component: "singleResponse" | "multipleResponse" | "text"
  props: {
    responses: { id: number; text: { de: string } }[] | null
  }
}

export type TPage = {
  id: number
  title: { de: string }
  description: {
    de: string
  }
  questions: TQuestion[] | null
  buttons: TButton[] | null
}

export type TSurvey = {
  id: number
  title: { de: string }
  createdAt: string
  version: number
  pages: TPage[]
}

type Props = { page: TPage; buttonActions: TParticipationButton["buttonActions"] }

export const Page: React.FC<Props> = ({ page, buttonActions }) => {
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
            <Question key={index} question={question} />
          ))}
        <div className="sm flex flex-col gap-2 pt-10 sm:flex-row-reverse sm:justify-end sm:space-y-0">
          {buttons?.map((button, index) => (
            <ParticipationButton buttonActions={buttonActions} key={index} button={button} />
          ))}
        </div>
      </>
    </section>
  )
}
