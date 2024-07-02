import { iframeResizer } from "iframe-resizer"
import { useEffect } from "react"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"
import { TEmail } from "./types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  email: TEmail
}

export const Email: React.FC<Props> = ({ email }) => {
  const { description, button, title, mailjetWidgetUrl, homeUrl } = email

  useEffect(() => {
    iframeResizer({}, "#mailjet-widget")
  }, [])

  return (
    <section>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {mailjetWidgetUrl && (
        <div
          className="rounded border border-gray-300 my-6 mt-10"
          dangerouslySetInnerHTML={{
            __html: `
              <iframe id="mailjet-widget" data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${mailjetWidgetUrl}" width="100%" style="height: 0px;"></iframe>
          `,
          }}
        />
      )}
      <div className="pt-10">
        {/* todo survey clean up after survey BB: link external */}
        <SurveyLink blank button={button.color} href={homeUrl}>
          {button.label.de}
        </SurveyLink>
      </div>
    </section>
  )
}
