import { SurveyMainPage } from "@/src/survey-public/components/SurveyMainPage"
import { emailDefinition } from "@/src/survey-public/frm7/data/email"
import { feedbackDefinition } from "@/src/survey-public/frm7/data/feedback"
import { moreDefinition } from "@/src/survey-public/frm7/data/more"
import { stageProgressDefinition } from "@/src/survey-public/frm7/data/progress"
import { surveyDefinition } from "@/src/survey-public/frm7/data/survey"
import { SurveyH1, SurveyP } from "../components/core/Text"
import { responseConfig } from "./data/response-config"
type Props = {
  surveyId: number
}

const StartContent = () => {
  return (
    <>
      <SurveyH1>Ihre Meinung zählt!</SurveyH1>
      <SurveyP>
        Frankfurt bekommt einen neuen Radschnellweg mit dem Namen FRM7, der ohne Umwege nach Maintal
        und Hanau führt. Radfahrende können auf Radschnellwegen sicher und komfortabel zum Ziel
        kommen.
      </SurveyP>
      <SurveyP>
        Wir möchten, dass viele Menschen diesen neuen Radweg nutzen können – sei es auf dem Weg zur
        Schule, Arbeit, Sport oder beim Einkaufen und Familienausflug. Damit das Projekt zum Erfolg
        wird, sind Ihre Wünsche und Hinweise von großer Bedeutung.\n\nSie haben bis zum{" "}
        <strong>31.03.2024</strong> Zeit, sich zu beteiligen.
      </SurveyP>
      <SurveyP>
        Die Beteiligung besteht aus <strong>zwei Teilen</strong>. Im ersten Teil möchten wir in
        einer kleinen Umfrage von Ihnen wissen, wie Sie sich im Verkehr bewegen und ob und wie Sie
        den Radschnellweg nutzen würden. Im zweiten Teil können Sie Ihre konkreten Hinweise und
        Wünsche zum Radschnellweg an uns richten. Diese werden von einem Planungsbüro ausgewertet.
        Auch wird die gesamte Beteiligung durch ein Forschungsprojekt begleitet.{" "}
      </SurveyP>
      <SurveyP>
        Es dauert nur <strong>5-10 Minuten</strong>, um die Fragen zu beantworten.
      </SurveyP>
      <SurveyP>Alle Ihre Angaben und Hinweise bleiben anonym, also geheim.</SurveyP>
      <SurveyP>
        Bei der Beteiligung geht es konkret um den neu betrachteten Abschnitt im{" "}
        <strong>Bereich Frankfurt</strong>. Falls Sie vorab noch mehr über die Route erfahren
        wollen, können Sie sich
        <a href="https://radschnellweg-frm7.de/route">hier</a> über das Projekt informieren:.
      </SurveyP>
    </>
  )
}
export const SurveyFRM7: React.FC<Props> = ({ surveyId }) => {
  return (
    <SurveyMainPage
      surveyId={surveyId}
      emailDefinition={emailDefinition}
      feedbackDefinition={feedbackDefinition}
      moreDefinition={moreDefinition}
      stageProgressDefinition={stageProgressDefinition}
      surveyDefinition={surveyDefinition}
      responseConfig={responseConfig}
      startContent={<StartContent />}
    />
  )
}
