import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Metadata } from "next"
import "server-only"
import { MailButton } from "./_components/MailButton"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Browser Version übermitteln",
}

export default function BrowserVersionPage() {
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
