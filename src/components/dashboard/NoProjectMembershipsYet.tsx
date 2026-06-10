import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { H1 } from "@/src/components/core/components/text/Headings"
import Logo from "@/src/components/shared/app/layouts/assets/trassenscout-logo-without-text.svg"
import { Img } from "@/src/components/shared/Img"

export const NoProjectMembershipsYet = () => {
  return (
    <div className="flex h-full w-full">
      <div className="mx-auto flex max-w-xl flex-col items-center py-24">
        <Img src={Logo} alt="Trassenscout" className="h-[60px] w-auto" height={60} width={69} />

        <H1 className="mt-12 text-center">Noch keiner Trasse zugeordnet</H1>
        <div className="mt-10 rounded-lg bg-white px-8 py-4 text-sm shadow-md">
          <p>
            Ein Admin wurde unterrichtet. Sobald Sie einer Trasse zugeordnet wurden, bekommen Sie
            eine Nachricht.
          </p>
          <p>
            Kam es zu einem Fehler?{" "}
            <LinkMail mailto="trassenscout@fixmycity.de">Admin kontaktieren</LinkMail>
          </p>
        </div>
      </div>
    </div>
  )
}
