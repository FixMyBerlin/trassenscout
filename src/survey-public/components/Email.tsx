import { iframeResizer } from "iframe-resizer"
import { useEffect } from "react"
import { SurveyH2, SurveyP } from "./core/Text"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"
import { TEmail } from "./types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  email: TEmail
}

export const Email: React.FC<Props> = ({ email }) => {
  const { description, questionText, button, title, mailjetWidgetUrl, homeUrl } = email

  useEffect(() => {
    iframeResizer({}, "#mailjet-widget")
  }, [])

  return (
    <section>
      <SurveyScreenHeader title={title.de} />
      <SurveyH2>{questionText.de}</SurveyH2>
      <SurveyP>{description.de}</SurveyP>
      <SurveyH2>Möchten Sie uns noch etwas mit auf den Weg geben?</SurveyH2>
      <SurveyP>
        Wenn Sie noch weiteres Feedback zur Online-Beteiligung haben, können Sie dies gerne an{" "}
        <SurveyLink href="mailto:info@radschnellverbindungen.info?subject=Feedback zum FRM7">
          info@radschnellverbindungen.info
        </SurveyLink>{" "}
        senden.{" "}
      </SurveyP>
      <SurveyP>
        <i>
          <strong>Transparenzhinweis</strong>: Die Befragung wurde um die Fragen („Sind Sie bzw.
          Ihre Eltern in Deutschland geboren“) gekürzt, da diese bei Teilnehmenden zu Irritationen
          geführt haben. Ziel der Fragen im Rahmen des Forschungsprojekts war die Ermittlung, welche
          Zielgruppen in zukünftigen Beteiligungen ggf. noch gezielter angesprochen werden müssen.
          Nach eingängiger Diskussion wurde entschieden, die beiden Fragen zu entfernen.
        </i>
      </SurveyP>

      <div
        className="rounded border border-gray-300 my-6 mt-10"
        dangerouslySetInnerHTML={{
          __html: `
              <iframe id="mailjet-widget" data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${mailjetWidgetUrl}" width="100%" style="height: 0px;"></iframe>
          `,
        }}
      />

      <div className="pt-10">
        <SurveyLink button={button.color} href={homeUrl}>
          {button.label.de}
        </SurveyLink>
      </div>
    </section>
  )
}
