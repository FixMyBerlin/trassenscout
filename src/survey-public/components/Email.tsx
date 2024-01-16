import { iframeResizer } from "iframe-resizer"
import { useEffect } from "react"
import { SurveyH2, SurveyP } from "./core/Text"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"
import { partcipationLinkStyles, partcipationRedLinkStyles } from "./core/links/styles"
import { TEmail } from "./types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  email: TEmail
  homeUrl: string
}

export const Email: React.FC<Props> = ({ email, homeUrl }) => {
  const { description, questionText, button, linkColor, title, mailjetWidgetUrl } = email

  useEffect(() => {
    iframeResizer({}, "#mailjet-widget")
  }, [])

  // todo frm7
  let colorClass: string
  switch (linkColor) {
    case "pink":
      colorClass = partcipationLinkStyles
      break
    case "red":
      colorClass = partcipationRedLinkStyles
      break
    default:
      colorClass = partcipationLinkStyles
  }

  return (
    <section>
      <SurveyScreenHeader title={title.de} />
      <SurveyH2>{questionText.de}</SurveyH2>
      <SurveyP>{description.de}</SurveyP>
      <SurveyH2>Möchten Sie uns noch etwas mit auf den Weg geben?</SurveyH2>
      <SurveyP>
        Wenn Sie noch weiteres Feedback zur Online-Beteiligung haben, können Sie dies gerne an{" "}
        <SurveyLink
          classNameOverwrites={colorClass}
          href="mailto:info@radschnellverbindungen.info?subject=Feedback zum FRM7"
        >
          info@radschnellverbindungen.info
        </SurveyLink>{" "}
        senden.{" "}
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
