import { SurveyMainPage } from "@/src/app/beteiligung-new/_components/SurveyMainPage"
import { SurveyH1, SurveyP } from "@/src/app/beteiligung-new/_components/Text"
type Props = {
  surveyId: number
}

const IntroPart1 = () => {
  return (
    <>
      <SurveyH1>RS TEST Ihre Meinung zählt!</SurveyH1>
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

export const SurveyRstest = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} introPart1={<IntroPart1 />} />
}
