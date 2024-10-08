import Logo from "@/src/app/_components/layouts/assets/trassenscout-logo-without-text.svg"
import { LinkMail } from "@/src/core/components/links"
import { H1 } from "@/src/core/components/text/Headings"
import Image from "next/image"

export const NoProjectMembershipsYet = () => {
  return (
    <div className="flex h-full w-full">
      <div className="mx-auto flex max-w-xl flex-col items-center py-24">
        <Image src={Logo} alt="Trassenscout" height={60} />

        <H1 className="mt-12 text-center">Noch keiner Trasse zugeordnet</H1>
        <div className="rounded-lg bg-white px-8 py-4 text-sm shadow-md">
          <p>
            Ein Admin wurde unterrichtet. Sobald Sie einer Trasse zugeordnet wurden, bekommen Sie
            eine Nachricht.
          </p>
          <p>
            Kam es zu einem Fehler?{" "}
            <LinkMail mailto="hello@trassenscout.de">Admin kontaktieren</LinkMail>
          </p>
        </div>
      </div>
    </div>
  )
}
