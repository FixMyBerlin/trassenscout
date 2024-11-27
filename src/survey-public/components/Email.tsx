import IframeResizer from "@iframe-resizer/react"
import { SurveyButton } from "./core/buttons/SurveyButton"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"
import { SurveyP } from "./core/Text"
import { TEmail } from "./types"

type Props = {
  email: TEmail
  onClickMore: () => void
}

export const Email: React.FC<Props> = ({ email, onClickMore }) => {
  const { description, button, title, mailjetWidgetUrl, homeUrl } = email

  return (
    <section>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {mailjetWidgetUrl && (
        <IframeResizer
          className="my-6 mt-10 rounded border border-gray-300"
          // https://iframe-resizer.com/frameworks/react/#typical-setup
          // "For non-comercial open source projects, iframe-resizer is free to use under the Gnu Public License. To confirm that you are using it in a compatable project set the license to GPLv3."
          license="GPLv3"
          src={mailjetWidgetUrl}
          style={{ width: "100%", height: "100vh" }}
        />
      )}
      <div className="pt-10">
        {/* todo survey clean up after survey BB: link external */}
        <SurveyLink blank button={button.color} href={homeUrl}>
          {button.label.de}
        </SurveyLink>
      </div>
      <div>
        <SurveyP>
          Ist Ihnen noch ein Hinweis eingefallen, den Sie mit uns teilen wolle? Unter dem Button
          können Sie diesen nachreichen.
        </SurveyP>
        <SurveyButton onClick={onClickMore}>Mir ist noch etwas eingefallen</SurveyButton>
      </div>
    </section>
  )
}
