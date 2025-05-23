import { Link, LinkMail, LinkTel } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Metadata } from "next"
import Image from "next/image"
import "server-only"
import svgImageLogoBmdvFoerderung from "./assets/logo-bmdv-foerderung.svg"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Kontakt & Impressum",
}
export default function KontaktPage() {
  return (
    <>
      <PageHeader title="Kontakt" />

      <section className="prose mt-12">
        <p>
          <strong>FixMyCity GmbH</strong>
          <br />
          Oberlandstraße 26-35
          <br />
          12099 Berlin
          <br />
          E-Mail-Adresse:{" "}
          <LinkMail mailto="feedback@fixmycity.de" subject="Feedback zum Trassenscout">
            hello@fixmycity.de
          </LinkMail>
          <br />
          Telefon: <LinkTel tel="+49-30-54908665">030 / 549 08 665</LinkTel>
          <br />
        </p>
        <p>Gesellschafter: Boris Hekele und Heiko Rintelen</p>
        <p>
          Registergericht: Amtsgericht Berlin-Charlottenburg
          <br />
          Registernummer: HRB 205031 B
        </p>
        <p>Umsatzsteuer-Identifikationsnummer gem. § 27a UStG: DE323489466</p>
        <p>Verantwortlicher i.S.v. § 55 Rundfunkstaatsvertrag (RStV): Boris Hekele</p>
      </section>

      <section className="prose mt-12">
        <h2 className="mb-2 text-3xl font-semibold">Feedback &amp; Kontakt</h2>
        <p>
          Wir freuen uns über Kommentare Anregungen und Unterstützung an{" "}
          <LinkMail mailto="feedback@fixmycity.de" subject="Feedback zum Trassenscout">
            feedback@fixmycity.de
          </LinkMail>
          .
        </p>
        <p>
          Sie finden uns auch auf{" "}
          <Link blank href="https://www.linkedin.com/company/fixmycity">
            LinkedIn
          </Link>
          .
        </p>
        {/* TODO: Update Github- und Lizenz Link! */}
        <p>
          Sofern Sie Bugs oder Verbesserungsvorschläge haben, geben Sie uns gerne{" "}
          <Link blank href="https://github.com/FixMyBerlin/trassenscout/issues/new">
            auf GitHub
          </Link>{" "}
          Feedback. Sie können den{" "}
          <Link href="https://github.com/FixMyBerlin/trassenscout/" blank>
            Source Code auch weiterentwickeln
          </Link>
          . Lizenz:{" "}
          <Link blank href="https://www.gnu.org/licenses/agpl-3.0.de.html">
            AGPL v3
          </Link>
          .
        </p>
        <h2>Urheberrechte Fotos</h2>
        <p>
          Wenn nicht anders angegeben stehen die auf dieser Website verwendeten Fotos unter{" "}
          <Link blank href="https://creativecommons.org/licenses/by-nc/4.0/">
            Creative Commons-Lizenz BY-NC 4.0
          </Link>
          .
        </p>
        <h2>Förderung</h2>
        <p>
          Diese Website wird im Rahmen des NRVP-Projektes “Modulares System für
          Radschnellverbindungen” vom Bundesministerium für Digitales und Verkehr (BMDV) gefördert.{" "}
          <br />
          (Förderkennzeichen VB2025,{" "}
          <Link
            blank
            href="https://www.mobilitaetsforum.bund.de/DE/Themen/Wissenspool/Projekte/Projektbeispiele/Projekte/22936_modulares_system_fuer_radschnellverbindu.html"
          >
            <strong>Projektsteckbrief</strong>
          </Link>
          )
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Link blank href="https://bmdv.bund.de/">
            <Image src={svgImageLogoBmdvFoerderung} alt="Förderung durch BMDV" />
          </Link>
        </div>
      </section>
    </>
  )
}
