export { FORM_ERROR } from "src/core/components/forms"
import { ParticipationLink } from "./core/links/ParticipationLink"
import { ScreenHeaderParticipation } from "./layout/ScreenHeaderParticipation"

export const Done = () => {
  return (
    <section>
      <ScreenHeaderParticipation
        title="Vielen Dank!"
        description="Ihre E-Mail-Adresse wurde vermerkt."
      />
      <ParticipationLink
        className="mt-32"
        button="white"
        href="https://radschnellweg8-lb-wn.de/beteiligung/"
      >
        Zurück Startseite
      </ParticipationLink>
    </section>
  )
}
