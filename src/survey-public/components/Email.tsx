import { iframeResizer } from "iframe-resizer"
import { useEffect } from "react"
import { SurveyH2, SurveyP } from "./core/Text"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  email: any // TODO
  homeUrl: string
}

export const Email: React.FC<Props> = ({ onSubmit, email, homeUrl }) => {
  const { description, questionText, button, title, mailjetWidgetUrl } = email

  useEffect(() => {
    iframeResizer({}, "#mailjet-widget")
  }, [])

  return (
    <section>
      <SurveyScreenHeader title={title.de} />
      <SurveyH2>{questionText.de}</SurveyH2>
      <SurveyP>{description.de}</SurveyP>

      <div
        className="rounded border border-gray-300 pb-2 my-6"
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
