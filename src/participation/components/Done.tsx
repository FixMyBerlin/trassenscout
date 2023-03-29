export { FORM_ERROR } from "src/core/components/forms"
import clsx from "clsx"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { ParticipationButtonWrapper } from "./core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"

export const Done = () => {
  return (
    <section>
      <ScreenHeaderParticipation
        title="Vielen Dank!"
        description="Ihre Emailadresse wurde vermerkt."
      />

      <Link
        className={clsx(whiteButtonStyles, "mt-32")}
        href="https://radschnellweg8-lb-wn.de/beteiligung"
      >
        Zurück Startseite
      </Link>
    </section>
  )
}
