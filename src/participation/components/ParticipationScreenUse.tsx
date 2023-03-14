import { ScreenHeaderParticipation } from "src/core/components/PageHeader/ScreenHeaderParticipation"
import { H2 } from "src/core/components/text/Headings"
import { ParticipationLabeledRadiobuttonGroup } from "./ParticipationLabeledRadiobuttonGroup"
export { FORM_ERROR } from "src/core/components/forms"

export type TSurveyItems = {
  id: number
  type: "radio" | "checkbox" | "textarea"
  question: { de: string; tr: string }
  answers: { de: string; tr: string }[]
}[]

export const PartcipationScreenUse: React.FC = () => {
  const surveyItems: TSurveyItems = [
    {
      id: 1,
      type: "radio",
      question: {
        de: "Wie häufig würden Sie den RS8 nutzen?",
        tr: "RS8'i ne sıklıkla kullanırsınız?",
      },
      answers: [
        { de: "Ja", tr: "Yes" },
        { de: "Nein", tr: "No" },
      ],
    },
    {
      id: 2,
      type: "radio",
      question: {
        de: "Wie häufig würden Sie den RS8 nutzen?",
        tr: "RS8'i ne sıklıkla kullanırsınız?",
      },
      answers: [
        { de: "Ja", tr: "Yes" },
        { de: "Nein", tr: "No" },
      ],
    },
    {
      id: 3,
      type: "radio",
      question: {
        de: "Wie häufig würden Sie den RS8 nutzen?",
        tr: "RS8'i ne sıklıkla kullanırsınız?",
      },
      answers: [
        { de: "Ja", tr: "Yes" },
        { de: "Nein", tr: "No" },
      ],
    },
  ]

  return (
    <section>
      <ScreenHeaderParticipation
        title="Nutzung des RS8"
        description="Zuerst möchten wir Ihnen einige Fragen zur Nutzung des RS 8 Ludwigsburg–Waiblingen stellen."
      />
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
    </section>
  )
}
