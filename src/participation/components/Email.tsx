export { FORM_ERROR } from "src/core/components/forms"
import clsx from "clsx"
import { useState } from "react"
import { Form } from "src/core/components/forms"
import { Link, pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { ParticipationButtonWrapper } from "./core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"
import { ParticipationH2, ParticipationP } from "./core/Text"
import { ParticipationLabeledTextField } from "./form/ParticipationLabeledTextField"

type Props = {
  onSubmit: any
}

export const Email: React.FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)

  const handleSubmit = () => {
    onSubmit(email)
  }

  // TODO: Event type
  const handleInputChange = (event: any) => {
    setEmail(event.target.value)
  }

  return (
    <section>
      <Form onSubmit={(values) => console.log(values)}>
        <ScreenHeaderParticipation title="Vielen Dank für Ihre Teilnahme" />
        <ParticipationH2>Was passiert jetzt?</ParticipationH2>
        <ParticipationP>
          Die Anregungen aus der Bürgerbeteiligung werden vom Planungsteam ausgewertet und geprüft,
          ob und inwieweit sie in die weitere Entwurfsplanung einfließen können. Wir bitten im
          Vorhinein um Verständnis, dass wir nicht jeden Hinweis kommentieren. Nach Abschluss der
          Beteiligung werden wir gebündelt Rückmeldung zu den angesprochenen Themen geben.
        </ParticipationP>
        <ParticipationH2>Möchten Sie weiter informiert werden?</ParticipationH2>
        <ParticipationP className="mb-12">
          Wenn Sie Ihre E-Mail-Adresse angeben, können wir ggf. Rückfragen stellen und informieren
          Sie über die Veröffentlichung der Ergebnisse und weitere Fortschritte im Projekt RS 8.
        </ParticipationP>
        <ParticipationLabeledTextField
          name="email"
          label=""
          placeholder="you@example.com"
          outerProps={{ className: "mb-6" }}
          onChange={handleInputChange}
        />
        {/* <ParticipationLabeledCheckbox
          name="consent"
          label="Ich stimme den Datenschutzbedingungen zur Verarbeitung meiner persönlichen Daten zu."
        /> */}

        <ParticipationButtonWrapper>
          <button
            disabled={!consent}
            onClick={handleSubmit}
            className={clsx(pinkButtonStyles, consent ? "" : "!bg-pink-200")}
            // TODO abstract in button component
            type="button"
          >
            Ja, halten Sie mich auf dem Laufenden
          </button>
          {/* TODO Link */}
          <Link
            className={whiteButtonStyles}
            href="https://www.landkreis-ludwigsburg.de/de/verkehr-sicherheit-ordnung/radverkehr/radschnellwege/"
          >
            Nein, zurück zur Startseite
          </Link>
        </ParticipationButtonWrapper>
      </Form>
    </section>
  )
}
