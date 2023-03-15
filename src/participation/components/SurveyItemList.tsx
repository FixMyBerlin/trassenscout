import { H2 } from "src/core/components/text/Headings"
import { ParticipationLabeledCheckboxGroup } from "./form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import { TSurveyItems } from "./screens/ParticipationScreenUse"
export { FORM_ERROR } from "src/core/components/forms"

type Props = { surveyItems: TSurveyItems }

export const SurveyItemList: React.FC<Props> = ({ surveyItems }) => {
  return (
    <>
      {surveyItems.map(({ id, type, question, answers }) => {
        return (
          <div key={id}>
            <H2>{question.de}</H2>
            {type === "radio" && (
              <ParticipationLabeledRadiobuttonGroup
                key={id}
                items={answers.map((item) => ({
                  scope: String(id),
                  name: item.de,
                  label: item.de,
                  value: item.de,
                }))}
              />
            )}
            {/* TODO */}
            {type === "checkbox" && (
              <ParticipationLabeledCheckboxGroup
                key={id}
                items={answers.map((item) => ({
                  name: item.de,
                  label: item.de,
                }))}
              />
            )}
            {/* TODO */}
            {type === "textarea" && (
              <ParticipationLabeledRadiobuttonGroup
                key={id}
                items={answers.map((item) => ({
                  scope: String(id),
                  name: item.de,
                  label: item.de,
                  value: item.de,
                }))}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
