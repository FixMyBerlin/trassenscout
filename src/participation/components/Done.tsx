export { FORM_ERROR } from "src/core/components/forms"
import clsx from "clsx"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"
import { useContext, useEffect } from "react"
import { ProgressContext } from "../context/contexts"

export const Done = () => {
  const { progress, setProgress } = useContext(ProgressContext)
  useEffect(() => {
    setProgress(8)
  }, [])
  return (
    <section>
      <ScreenHeaderParticipation
        title="Vielen Dank!"
        description="Ihre Emailadresse wurde vermerkt."
      />
      {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
      <Link
        className={clsx(whiteButtonStyles, "mt-32")}
        href="https://develop--rsv8-lb-wn.netlify.app/beteiligung/"
      >
        Zurück Startseite
      </Link>
    </section>
  )
}
