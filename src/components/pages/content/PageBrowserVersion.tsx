import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { MailButton } from "./browser-version/_components/MailButton"

export function PageBrowserVersion() {
  return (
    <>
      <PageHeader title="Browser Version übermitteln" />

      <section className="prose mt-12">
        <MailButton />
        <p>Die E-Mail enthält Angaben zum Browser und System.</p>
        <p>Bitte senden Sie diese E-Mail an uns ab.</p>
      </section>
    </>
  )
}
