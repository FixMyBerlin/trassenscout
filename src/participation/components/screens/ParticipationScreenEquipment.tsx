import { ScreenHeaderParticipation } from "src/core/components/PageHeader/ScreenHeaderParticipation"
import { SurveyItemList } from "../SurveyItemList"
import { TSurveyItems } from "./ParticipationScreenUse"
export { FORM_ERROR } from "src/core/components/forms"

export const PartcipationScreenEquipment: React.FC = () => {
  const surveyItems: TSurveyItems = [
    {
      id: 4,
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
      id: 5,
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
      id: 6,
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
        title="Austattung des RS8"
        description="Zuerst möchten wir Ihnen einige Fragen zur Nutzung des RS 8 Ludwigsburg–Waiblingen stellen."
      />
      <SurveyItemList surveyItems={surveyItems} />
    </section>
  )
}
