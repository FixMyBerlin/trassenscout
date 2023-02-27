import { EnvelopeIcon } from "@heroicons/react/24/outline"
import React from "react"
import { LinkMail, LinkTel } from "src/core/components/links"

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6 flex-none"
    >
      <path
        d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-gray-100 stroke-gray-400"
      />
      <path d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6" className="stroke-gray-400" />
    </svg>
  )
}

export const PageHomePublicContact: React.FC = () => {
  return (
    <section className="rounded-2xl border border-gray-100 p-6">
      <h2 className="flex items-center text-sm font-semibold text-gray-900">
        <EnvelopeIcon className="h-6 w-6 flex-none text-gray-400" />
        <span className="mt-0.5 ml-3">Kontakt</span>
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
