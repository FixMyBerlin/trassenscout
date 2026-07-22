import { twMerge } from "tailwind-merge"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { MailButton } from "./browser-version/_components/MailButton"

export function PageBrowserVersion() {
  return (
    <>
      <PageHeader title="Browser Version übermitteln" />

      <section className={twMerge(proseClasses, pageContentPaddingClassName, "w-full")}>
        <MailButton />
        <p>Die E-Mail enthält Angaben zum Browser und System.</p>
        <p>Bitte senden Sie diese E-Mail an uns ab.</p>
      </section>
    </>
  )
}
