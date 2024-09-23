import { LinkMail, LinkTel } from "@/src/core/components/links"
import { EnvelopeIcon } from "@heroicons/react/24/outline"

export const MarketingPageContact = () => {
  return (
    <section className="rounded-2xl border border-gray-100 p-6">
      <h2 className="flex items-center text-sm font-semibold text-gray-900">
        <EnvelopeIcon className="h-6 w-6 flex-none text-gray-400" />
        <span className="ml-3">Kontakt</span>
      </h2>
      <p className="mt-2 text-sm leading-6">
        <strong>FixMyCity GmbH</strong>
        <br />
        <LinkMail>hello@trassenscout.de</LinkMail>
        <br />
        <LinkTel>+49-30 / 549 08 665</LinkTel>
      </p>
    </section>
  )
}
