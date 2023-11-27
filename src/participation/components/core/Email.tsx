import { iframeResizer } from "iframe-resizer"
import { useEffect } from "react"
import { ParticipationH2, ParticipationP } from "./Text"
import { ScreenHeaderParticipation } from "./layout/ScreenHeaderParticipation"
import { ParticipationLink } from "./links/ParticipationLink"

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
      <ScreenHeaderParticipation title={title.de} />
      <ParticipationH2>{questionText.de}</ParticipationH2>
      <ParticipationP>{description.de}</ParticipationP>

      <div
        className="rounded border border-gray-300 pb-2 my-6"
        dangerouslySetInnerHTML={{
          __html: `
              <iframe id="mailjet-widget" data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${mailjetWidgetUrl}" width="100%" style="height: 0px;"></iframe>
          `,
        }}
      />

      <div className="pt-10">
        <ParticipationLink button={button.color} href={homeUrl}>
          {button.label.de}
        </ParticipationLink>
      </div>
    </section>
  )
}
