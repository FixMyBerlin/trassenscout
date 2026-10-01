import { Fragment, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { proseClasses } from "@/src/components/core/components/text/prose"

const MatomoIframe = () => {
  return (
    <iframe
      title="Matomo Opt Out Tracking"
      className="h-52 w-full border border-gray-200 bg-[#f0fdf4] p-2"
      src="https://s.fixmycity.de/index.php?module=CoreAdminHome&action=optOut&language=de&backgroundColor=f0fdf4&fontColor=374151&fontSize=16px&fontFamily=Arial"
    />
  )
}

const portalLegalBasis =
  "Es gilt die im Abschnitt „Rechtsgrundlage“ unter „Bereitstellung des Portals“ beschriebene Rechtsgrundlage."

type ServiceDetailsProps = {
  data: ReactNode
  purpose: ReactNode
  legalBasis?: ReactNode
  recipient: ReactNode
  thirdCountry: ReactNode
  storage: ReactNode
  headingLevel?: 4 | 5
}

const serviceDetailLabelClassName = "mt-4 mb-0 text-base font-semibold first:mt-0"

const ServiceDetails = ({
  data,
  purpose,
  legalBasis = portalLegalBasis,
  recipient,
  thirdCountry,
  storage,
  headingLevel = 5,
}: ServiceDetailsProps) => {
  const Label = headingLevel === 4 ? "h4" : "h5"
  const details = [
    ["Allgemeine Informationen", data],
    ["Zweck der Verarbeitung", purpose],
    ["Rechtsgrundlage", legalBasis],
    ["Empfänger", recipient],
    ["Drittlandübermittlung und Garantien", thirdCountry],
    ["Speicherdauer", storage],
  ] as const

  return (
    <div>
      {details.map(([label, value]) => (
        <Fragment key={label}>
          <Label className={serviceDetailLabelClassName}>{label}</Label>
          <p className="mt-1">{value}</p>
        </Fragment>
      ))}
    </div>
  )
}

/** One service under "Eingesetzte Dienste und Empfänger". */
const ServiceSection = ({ name, ...details }: { name: string } & ServiceDetailsProps) => (
  <>
    <h4 className="text-lg">{name}</h4>
    <ServiceDetails {...details} />
  </>
)

export function PageDatenschutz() {
  return (
    <>
      <PageHeader
        title="Datenschutzerklärung"
        titleVisuallyHidden
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbStep>Datenschutzerklärung</BreadcrumbStep>
          </Breadcrumb>
        }
      />

      <div className={twMerge(proseClasses, pageContentPaddingClassName, "mt-6 w-full")}>
        <h2 id="intro">Einleitung</h2>
        <p>
          Mit den nachfolgenden Informationen wollen wir Ihnen einen Überblick über die Verarbeitung
          Ihrer personenbezogenen Daten auf unserer Website trassenscout.de (nachfolgend „Website“
          genannt) geben. Wir wollen Sie ebenfalls über Ihre Rechte aus dem Datenschutzrecht
          informieren. Die Verarbeitung Ihrer personenbezogenen Daten durch uns erfolgt stets im
          Einklang mit der Datenschutzgrundverordnung (nachfolgend „DSGVO“ genannt) sowie allen
          geltenden landesspezifischen Datenschutzbestimmungen.
        </p>
        <ul>
          <li>
            <a href="#intro">Einleitung</a>
          </li>
          <li>
            <a href="#responsible">Verantwortlichkeit</a>
          </li>
          <li>
            <a href="#hosting">Bereitstellung</a>
          </li>
          <li>
            <a href="#cookies">Cookies</a>
          </li>
          <li>
            <a href="#analytics">Webanalyse</a>
          </li>
          <li>
            <a href="#contact">Kontaktmöglichkeiten</a>
          </li>
          <li>
            <a href="#newsletter">Newsletter</a>
          </li>
          <li>
            <a href="#rights">Ihre Rechte</a>
          </li>
          <li>
            <a href="#updates">Aktualität &amp; Änderungen</a>
          </li>
        </ul>

        <h2 id="responsible">Verantwortlichkeit</h2>
        <h3>Verantwortlich im Sinne der DSGVO</h3>
        <p>
          <strong>FixMyCity GmbH</strong>
          <br />
          Oberlandstraße 26-35
          <br />
          12099 Berlin
          <br />
          E-Mail: <LinkMail>hello@fixmycity.de</LinkMail>
          <br />
          Telefon: <LinkTel>+49 30 549 08 665</LinkTel>
        </p>
        <h3>Datenschutzbeauftragter</h3>
        <p>Unsere Datenschutzbeauftragten erreichen Sie wie folgt:</p>
        <p>
          <strong>secjur GmbH</strong>
          <br />
          Niklas Hanitsch
          <br />
          Steinhöft 9
          <br />
          20459 Hamburg
          <br />
          E-Mail: <LinkMail>dsb@secjur.com</LinkMail>
          <br />
          Telefon: <LinkTel>+49 40 228 599 520</LinkTel>
        </p>
        <p>
          Sie können sich jederzeit bei allen Fragen und Anregungen zum Datenschutz sowie zur
          Ausübung Ihrer Rechte direkt an unseren Datenschutzbeauftragten wenden.
        </p>

        <h3 id="thirdparty">Einsatz von Drittdiensten</h3>
        <p>
          Für bestimmte Funktionen und Services auf unserer Website setzen wir Dienste von
          Drittanbietern ein. Die konkreten Dienste können jeweils den entsprechenden Kapiteln
          entnommen werden.
        </p>
        <p>
          Teilweise setzen wir Dienstleister ein, die ihren Sitz in einem Drittland haben, also
          außerhalb der EU. Wir übermitteln Daten nur in Drittländer, in denen ein angemessenes
          Datenschutzniveau bzw. geeignete Garantien i. S. d. Art. 44-49 DSGVO vorliegen. Sie haben
          das Recht, eine Kopie der von uns getroffenen geeigneten Garantien anzufordern. Schreiben
          Sie uns dazu gerne eine E-Mail an die in diesen Datenschutzhinweisen genannte
          E-Mail-Adresse.
        </p>

        <h2 id="hosting">Bereitstellung des Portals</h2>
        <p>
          Unser Angebot besteht aus einem öffentlichen und einem nicht-öffentlichen Teil.{" "}
          <strong>Im öffentlichen Teil</strong> geben wir Ihnen und teilnehmenden Kommunen eine
          einfache Möglichkeit, sich auf elektronischem Weg zu bestimmten Planungsvorhaben zu äußern
          (Beteiligungsformulare). Spiegelbildlich geben wir den teilnehmenden Kommunen die
          Möglichkeit, das (anonyme) Feedback in einem internen Bereich einzusehen und sich intern
          zu den jeweiligen Projekten mit weiteren Interessengruppen auszutauschen. Art und Umfang
          der personenbezogenen Daten, die durch uns verarbeitet werden, unterscheiden sich
          teilweise; je nachdem, ob Sie den öffentlichen oder den nicht-öffentlichen Bereich nutzen.
        </p>

        <h3>Allgemeine Informationen</h3>
        <p>
          Beim Besuch unseres Portals werden automatisch Daten verarbeitet, die Ihr Browser an
          unseren Server übermittelt. Diese allgemeinen Daten und Informationen werden in den
          Logfiles des Servers gespeichert (in sog. „Server-Logfiles“). Erfasst werden können die
        </p>
        <ul>
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem sowie Angaben zum Endgerät</li>
          <li>Referrer URL (zuvor besuchte Website)</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Datum und Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
          <li>Nutzungsdaten</li>
          <li>Betrachteter Kartenausschnitt</li>
        </ul>

        <h3>Öffentlicher Bereich / Beteiligungsformulare</h3>
        <p>
          Wenn Sie eines unserer Beteiligungsformulare nutzen und Ihre Eingaben absenden,
          verarbeiten wir zusätzlich folgende Datenkategorien:
        </p>
        <ul>
          <li>Angaben zur Nutzung des Trassenabschnitts</li>
          <li>Angabe zum betroffenen Streckenabschnitt</li>
          <li>Inhalte von Freitextfeldern</li>
        </ul>
        <p>
          Die Daten werden umgehend anonymisiert und so gespeichert, dass diese zu einem späteren
          Zeitpunkt <strong>nicht</strong> mit einer der oben genannten Datenarten in Verbindung
          gebracht werden können.
        </p>

        <h3>Öffentlicher Bereich / Stakeholderumfrage</h3>
        <p>
          Im Rahmen unserer Beteiligungen führen wir teilweise außerordentliche
          Beteiligungsbefragungen durch. Dabei werden ausgewählte Kommunen mit dem Ersuchen zur
          Teilnahme an der Beteiligungsbefragung kontaktiert. Wenn Sie als Teil dieser Befragung an
          der Beteiligung teilnehmen, werden – zusätzlich zu den oben aufgeführten, anonymisierten
          Daten – noch folgende personenbezogenen Daten von uns erhoben:
        </p>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>Name, Vorname</li>
          <li>Name der Institution des Befragten</li>
        </ul>
        <p>
          Die Speicherung dieser Daten ist für den ordnungsgemäßen Ablauf der Beteiligung notwendig,
          da Rückfragen zu den Befragungsergebnissen auftreten können. Die Verarbeitung dieser Daten
          stützen wir auf Ihre ausdrückliche, im Rahmen der Befragung erteilte Einwilligung gemäß
          Art. 6 Abs. 1 Satz 1 lit. a DSGVO. Die Einladungen zur Beteiligungsbefragung versenden wir
          per E-Mail über den externen Dienstleister Brevo. Dabei werden Ihre E-Mail-Adresse und die
          für den Versand erforderlichen Daten in unserem Auftrag verarbeitet. Weitere Informationen
          zu Brevo, den verarbeiteten Daten, möglichen Drittlandübermittlungen und der Speicherdauer
          finden Sie im Abschnitt „Eingesetzte Dienste und Empfänger“.
        </p>
        <p>
          Die im Rahmen der Beteiligungsbefragung erhobenen Kontaktdaten löschen wir, sobald die
          jeweilige Beteiligung abgeschlossen ist und mit Rückfragen nicht mehr zu rechnen ist,
          spätestens jedoch 24 Monate nach Abschluss der Beteiligung. Widerrufen Sie Ihre
          Einwilligung vorher, löschen wir die Daten unverzüglich.
        </p>

        <h3>Interner Bereich</h3>
        <p>
          Bei der Erstellung der Zugänge zum internen Bereich und dessen Nutzung werden durch uns
          außerdem folgende weitere personenbezogener Daten erfasst:
        </p>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>Passwort (in verschlüsselter Form)</li>
          <li>Telefonnummer (optional)</li>
          <li>Rolle in der Organisation (optional)</li>
          <li>Liste Ihrer Projekte und Ihre Berechtigungen</li>
          <li>
            Wenn als Projektmanager:in zugewiesen: Projektbeschreibungen (inkl. geographischer
            Angaben)
          </li>
          <li>Kontaktdaten und Termine</li>
          <li>Notizen, soweit diese personenbezogene Daten enthalten</li>
          <li>Hochgeladene Dateien, soweit diese personenbezogene Daten enthalten</li>
          <li>
            Projektinterne Änderungsprotokolle zu Planungs- und Beteiligungsdaten, insbesondere
            Zeitpunkt, betroffener Datensatz, Art der Änderung und verantwortlicher Account.
          </li>
          <li>
            Kommentare zu Hinweisen, Prozessen mit Trägern öffentlicher Belange und Planungen
            einschließlich Kommentarinhalt, Verfasser:in und Zeitstempel.
          </li>
        </ul>

        <h3>Interkommunale Sichtbarkeit von Projektinformationen</h3>
        <p>
          Der Trassenscout ist als interkommunales Werkzeug konzipiert. Planungsunterlagen,
          Projektbeschreibungen, hochgeladene Dateien, Notizen, Kommentare und sonstige
          projektbezogene Informationen, die im internen Bereich bereitgestellt werden, können im
          Rahmen der jeweils eingerichteten Rollen- und Zugriffsberechtigungen auch von anderen am
          jeweiligen Projekt beteiligten Nutzer:innen eingesehen werden. Dazu können insbesondere
          Beschäftigte anderer beteiligter Kommunen sowie weitere von den Projektverantwortlichen
          berechtigte Projektbeteiligte gehören. Soweit diese Inhalte personenbezogene Daten
          enthalten, umfasst die Verarbeitung auch deren Bereitstellung an diesen Nutzerkreis zum
          Zweck der interkommunalen Planung, Abstimmung und Zusammenarbeit. Mit Aktivierung der
          Checkbox im Registrierungsprozess bestätigt die registrierende Kommune, dass sie diese
          Datenschutzerklärung zur Kenntnis genommen hat. Die projektbezogene Sichtbarkeit beruht
          nicht auf einer Einwilligung, sondern auf der im Abschnitt „Rechtsgrundlage“ genannten
          Grundlage. Es dürfen nur Informationen und Unterlagen bereitgestellt werden, die für
          diesen Nutzerkreis bestimmt sind und zu deren Bereitstellung die jeweilige Kommune
          berechtigt ist. Besondere Kategorien personenbezogener Daten im Sinne des Art. 9 DSGVO
          dürfen nicht eingestellt werden.
        </p>

        <h3>Aufbereitung von Planungsinformationen</h3>
        <p>
          Zur Aufbereitung von Planungsinformationen setzen wir den KI-gestützten Dienst OpenAI ein.
          Dieser verarbeitet die bereitgestellten Informationen für die Datenbank zur internen
          Nutzung im Trassenscout. Eine automatisierte Entscheidungsfindung einschließlich Profiling
          im Sinne des Art. 22 DSGVO findet nicht statt; die Ergebnisse der KI-gestützten
          Aufbereitung werden ausschließlich zur Vorbereitung einer Bearbeitung durch unsere
          Mitarbeitenden genutzt. Weitere Informationen finden Sie im Abschnitt „OpenAI Ireland
          Ltd.“ unter „Eingesetzte Dienste und Empfänger“.
        </p>
        <ul>
          <li>Betreff, Inhalt und Absenderangaben von E-Mails</li>
          <li>
            PDF-Dokumente einschließlich Metadaten und darin enthaltene personenbezogene Daten
          </li>
          <li>erzeugte Analyseergebnisse</li>
        </ul>

        <h3>Zweck der Verarbeitung</h3>
        <p>
          Bei der Nutzung dieser allgemeinen Daten und Informationen ziehen wir keine Rückschlüsse
          auf Ihre Person. Zu den von uns verfolgten Zwecken gehört insbesondere:
        </p>
        <ul>
          <li>
            die Gewährleistung eines reibungslosen Verbindungsaufbaus der Website und Bereitstellung
            des Portals,
          </li>
          <li>Aufbereitung und Zusammenfassung der Beteiligungsbögen,</li>
          <li>
            die Dokumentation und Nachvollziehbarkeit von Änderungen an Planungs- und
            Beteiligungsdaten,
          </li>
          <li>
            die projektinterne Kommunikation und Zusammenarbeit zu Hinweisen, Prozessen mit Trägern
            öffentlicher Belange und Planungen,
          </li>
          <li>die Aufklärung von Missbrauchs- oder Betrugshandlungen,</li>
          <li>Problemanalysen im Netzwerk, sowie</li>
          <li>die Auswertung der Systemsicherheit und -stabilität.</li>
        </ul>

        <h3>Rechtsgrundlage</h3>
        <p>
          Die Rechtsgrundlage für die Datenverarbeitung ist unser berechtigtes Interesse im Sinne
          des Art. 6 Abs. 1 S. 1 lit. f DSGVO. Wir haben ein überwiegendes berechtigtes Interesse
          daran, unser Angebot (technisch einwandfrei) anbieten zu können. Unser berechtigtes
          Interesse umfasst insbesondere die Nachvollziehbarkeit projektbezogener Änderungen, die
          koordinierte Zusammenarbeit der Projektbeteiligten und die Dokumentation des
          Planungsprozesses.
        </p>
        <p>
          Die projektbezogene Bereitstellung von Notizen, Kommentaren, Planungsunterlagen und
          weiteren Informationen gegenüber berechtigten Projektbeteiligten stützen wir auf Art. 6
          Abs. 1 Satz 1 lit. f DSGVO. Unser berechtigtes Interesse und das Interesse der beteiligten
          Organisationen bestehen in der Durchführung einer koordinierten interkommunalen Planung,
          der gemeinsamen Nutzung einer aktuellen Informationsgrundlage sowie der nachvollziehbaren
          Dokumentation von Zuständigkeiten, Entscheidungen und Änderungen. Der Zugriff wird auf die
          dem jeweiligen Projekt zugeordneten Nutzer:innen und deren erforderliche Berechtigungen
          beschränkt. Sie können dieser Verarbeitung aus Gründen, die sich aus Ihrer besonderen
          Situation ergeben, jederzeit widersprechen; Einzelheiten finden Sie im Abschnitt
          „Widerspruch (Art. 21 DSGVO)“.
        </p>
        <p>
          Soweit wir Ihre personenbezogenen Daten zur Einrichtung und Verwaltung Ihres Zugangs zum
          internen Bereich sowie zur Erbringung der dort angebotenen Funktionen verarbeiten, ist
          Rechtsgrundlage zusätzlich Art. 6 Abs. 1 S. 1 lit. b DSGVO. Die Verarbeitung ist zur
          Begründung und Durchführung des zwischen Ihnen und uns bestehenden Nutzungsverhältnisses
          erforderlich.
        </p>

        <h3>Speicherdauer</h3>
        <p>
          Die Logfiles werden aus Sicherheitsgründen durch den Auftragsverarbeiter (siehe unten, z.
          B. zur Aufklärung von Missbrauchs- oder Betrugshandlungen) für die Dauer von maximal 30
          Tagen gespeichert und danach gelöscht. Daten, deren weitere Aufbewahrung zu Beweiszwecken
          erforderlich ist, werden bis zur endgültigen Klärung der Angelegenheit aufbewahrt.
          Registrierungsdaten und personenbezogene Inhalte werden bei Löschung des Accounts aus dem
          Produktivsystem gelöscht. In Sicherungskopien bleiben sie noch für 90 Tage gespeichert und
          werden anschließend automatisch überschrieben oder gelöscht. Projektinterne
          Änderungsprotokolle werden für 24 Monate gespeichert und anschließend gelöscht. Kommentare
          werden bis zu ihrer Löschung, der Löschung des zugehörigen Projekts oder dem Wegfall des
          Verarbeitungszwecks gespeichert.
        </p>

        <h3>Eingesetzte Dienste und Empfänger</h3>
        <p>
          Wir setzen für die Bereitstellung und den Betrieb des Portals folgende Dienstleister ein.
          Die Dienste sind funktional geordnet: Karten (MapTiler); Hosting, Dateien und Backups
          (IONOS, Amazon Web Services, SCALEWAY und luckycloud); E-Mail und Benachrichtigungen
          (Brevo und Migadu); KI-Verarbeitung (OpenAI); Webanalyse (Matomo, von uns selbst gehostet,
          siehe Abschnitt „Webanalyse“).
        </p>

        <ServiceSection
          name="MapTiler AG"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: IP-Adresse und technische Verbindungs- und Anfragedaten, insbesondere Zeitpunkt und angeforderte Kartenressourcen; keine Inhalte der Beteiligungsformulare"
          purpose="Bereitstellung und Übermittlung von Kartenmaterial"
          recipient="MapTiler AG, Hüfnerstrasse 98, 6314 Unterägeri, Schweiz"
          thirdCountry="Ja, Schweiz. Angemessenheitsbeschluss der EU-Kommission gemäß Art. 45 DSGVO; zusätzlich Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO"
          storage="IP-Adressen werden höchstens 20 Minuten zwischengespeichert und anschließend gelöscht."
        />
        <ServiceSection
          name="IONOS SE"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: Technische Verbindungs- und Protokolldaten, insbesondere IP-Adresse, Zugriffszeitpunkt, aufgerufene Ressource, Referrer, Browsertyp und Endgeräteinformationen"
          purpose="Hosting der Website einschließlich des internen Bereichs sowie Bereitstellung ihrer Inhalte"
          recipient="IONOS SE, Elgendorfer Straße 57, 56410 Montabaur, Deutschland"
          thirdCountry="Nein; Verarbeitung in Deutschland beziehungsweise innerhalb der EU. Kein Drittlandtransfer; Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO"
          storage="Hosting-Inhalte bis zur Löschung beziehungsweise Vertragsbeendigung; technische Protokolldaten gemäß der Konfiguration des eingesetzten IONOS-Produkts, längstens 30 Tage"
        />
        <ServiceSection
          name="Amazon Web Services EMEA SARL"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: Hochgeladene Planungsunterlagen und Dateien einschließlich darin enthaltener personenbezogener Daten und Metadaten sowie technische Zugriffs-, Nutzungs- und Protokolldaten"
          purpose="Speicherung und Bereitstellung hochgeladener Dateien sowie Speicherung technischer Webanalyse- und Protokolldaten"
          recipient="Amazon Web Services EMEA SARL, 38 Avenue John F. Kennedy, L-1855 Luxemburg"
          thirdCountry="Ja, nicht auszuschließen; die Speicherung erfolgt in der AWS-Region Frankfurt, Zugriffe aus Drittländern, insbesondere aus den USA, können jedoch nicht vollständig ausgeschlossen werden. Auftragsverarbeitungsvertrag; bei Drittlandübermittlungen SCC gemäß Art. 46 DSGVO oder Angemessenheitsbeschluss gemäß Art. 45 DSGVO"
          storage="Dateien bis zu ihrer Löschung, der Löschung des zugehörigen Projekts oder dem Wegfall des Verarbeitungszwecks; technische Protokolldaten höchstens 30 Tage"
        />
        <ServiceSection
          name="SCALEWAY SAS"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: Sicherungskopien der Registrierungs-, Kontakt-, Projekt-, Planungs- und Inhaltsdaten einschließlich hochgeladener Dateien und technischer Protokolldaten"
          purpose="Erstellung und Speicherung von Sicherungskopien"
          recipient="SCALEWAY SAS, 8 rue de la Ville-l’Évêque, 75008 Paris, Frankreich"
          thirdCountry="Nein; Verarbeitung innerhalb der EU. Kein Drittlandtransfer; Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO"
          storage="Sicherungskopien werden für 90 Tage aufbewahrt und anschließend automatisch überschrieben oder gelöscht."
        />
        <ServiceSection
          name="luckycloud GmbH"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: Hochgeladene Planungsunterlagen und Dateien einschließlich darin enthaltener personenbezogener Daten sowie Datei-, Freigabe- und Account-Metadaten"
          purpose="Speicherung, Übermittlung und gemeinschaftliche Bearbeitung von Planungsunterlagen und projektbezogenen Dateien"
          recipient="luckycloud GmbH, Solmsstraße 26, 10961 Berlin, Deutschland"
          thirdCountry="Nein; Verarbeitung in Deutschland beziehungsweise innerhalb der EU. Kein Drittlandtransfer; Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO"
          storage="Bis zur Löschung, zum Zweckwegfall oder zur Vertragsbeendigung; längere Speicherung nur aufgrund gesetzlicher Aufbewahrungspflichten"
        />
        <ServiceSection
          name="Brevo GmbH"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: E-Mail-Adresse der eingeladenen oder benachrichtigten Person, Name der einladenden Person, Nachrichteninhalt sowie Versand-, Zustell- und Ereignisdaten"
          purpose="Versand von Registrierungslinks, Einladungen, Einladungen zur Beteiligungsbefragung und projektbezogenen Benachrichtigungen sowie Nachweis des Versands von Einladungen im Rahmen der Beteiligungsverfahren"
          recipient="Brevo GmbH, Köpenicker Straße 126, 10179 Berlin, Deutschland"
          thirdCountry="Ja, nicht auszuschließen; die Speicherung erfolgt innerhalb der EU, Drittlandzugriffe durch Unterauftragsverarbeiter können jedoch nicht vollständig ausgeschlossen werden. Auftragsverarbeitungsvertrag; bei Drittlandübermittlungen SCC gemäß Art. 46 DSGVO oder Angemessenheitsbeschluss gemäß Art. 45 DSGVO"
          storage="Bis zum Wegfall des Versandzwecks oder zur Löschung; Versand-, Zustell- und Ereignisprotokolle 24 Monate"
        />
        <ServiceSection
          name="Migadu-Mail GmbH"
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: E-Mail-Adressen, Absender- und Empfängerdaten, E-Mail-Inhalte, Betreffzeilen, Anhänge und technische Nachrichtenmetadaten"
          purpose="Bereitstellung der E-Mail-Infrastruktur, Versand und Empfang von E-Mails, Betriebsabsicherung und Missbrauchsabwehr"
          recipient="Migadu-Mail GmbH, Rohnen 587, CH-9414 Schachen, Schweiz"
          thirdCountry="Ja, Schweiz. Angemessenheitsbeschluss der EU-Kommission gemäß Art. 45 DSGVO; zusätzlich Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO"
          storage="Bis zur Löschung oder Vertragsbeendigung; nach Vertragsende grundsätzlich Löschung innerhalb von 30 Tagen, soweit keine gesetzlichen Aufbewahrungspflichten bestehen"
        />
        <ServiceSection
          name="OpenAI Ireland Ltd."
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: Betreff, Inhalt und Absenderangaben von E-Mails, PDF-Dokumente einschließlich Metadaten und darin enthaltene personenbezogene Daten sowie erzeugte Analyseergebnisse"
          purpose="Verarbeitung, Strukturierung und Analyse von E-Mail-Inhalten und Planungsunterlagen mithilfe von KI-Modellen; kein Modelltraining ohne ausdrückliche Zustimmung"
          recipient="OpenAI Ireland Ltd., 1st Floor, The Liffey Trust Centre, 117–126 Sheriff Street Upper, Dublin 1, D01 YC43, Irland"
          thirdCountry="Ja, nicht auszuschließen; eine Verarbeitung durch verbundene Unternehmen oder Unterauftragsverarbeiter außerhalb des EWR, insbesondere in den USA, kann nicht ausgeschlossen werden. Auftragsverarbeitungsvertrag; bei Drittlandübermittlungen SCC gemäß Art. 46 DSGVO oder Angemessenheitsbeschluss gemäß Art. 45 DSGVO"
          storage="Missbrauchsprotokolle grundsätzlich bis zu 30 Tage; Eingaben und Modellantworten zusätzlich standardmäßig 30 Tage."
        />
        <ServiceSection
          name="Inhalte der Domain fixmycity.de"
          data="Beim Aufruf unseres Portals wird von der Domain fixmycity.de eine JavaScript-Datei unseres Webanalysedienstes Matomo nachgeladen (siehe Abschnitt „Webanalyse“). Diese Domain wird von uns selbst betrieben. Beim Nachladen übermittelt Ihr Browser die für den Abruf technisch erforderlichen Daten an den Server dieser Domain, insbesondere Ihre IP-Adresse, den Zeitpunkt des Abrufs, die angeforderte Ressource, die verweisende Seite sowie Browser- und Endgeräteinformationen."
          purpose="Bereitstellung und Anzeige der auf diesen Unterseiten eingebundenen Inhalte."
          legalBasis={`${portalLegalBasis} Eine Einwilligung nach § 25 Abs. 1 TDDDG ist nicht erforderlich, da hierbei keine Informationen auf Ihrem Endgerät gespeichert oder aus diesem ausgelesen werden.`}
          recipient="FixMyCity GmbH, Oberlandstraße 26-35, 12099 Berlin, Deutschland. Empfänger ist damit dieselbe Verantwortliche, die auch dieses Portal betreibt; eine Übermittlung an einen Dritten findet nicht statt. Zu den beim Betrieb der Domain fixmycity.de eingesetzten Dienstleistern informieren wir in der Datenschutzerklärung dieser Website."
          thirdCountry="Nein; Verarbeitung in Deutschland beziehungsweise innerhalb der EU."
          storage="Technische Protokolldaten werden für die Dauer von maximal 30 Tagen gespeichert und danach gelöscht."
        />

        <h2 id="cookies">Cookies</h2>
        <h3>Allgemeine Informationen</h3>
        <p>
          Beim Besuch unserer Website können Informationen auf Ihrem Endgerät gespeichert oder aus
          diesem ausgelesen werden. Dazu zählen Cookies sowie vergleichbare Techniken wie der lokale
          Speicher Ihres Browsers. Wir setzen solche Techniken nur ein, soweit sie für den Betrieb
          der Website und des Portals unbedingt erforderlich sind.
        </p>
        <p>
          Unbedingt erforderlich sind im internen Bereich ein Anmeldecookie zur Aufrechterhaltung
          Ihrer Anmeldung (Speicherdauer: 7 Tage) sowie ein kurzlebiges Cookie zur
          Zwischenspeicherung der Sitzungsdaten (Speicherdauer: 5 Minuten). Unser Webanalysedienst
          Matomo setzt keine Cookies und greift nicht auf Informationen in Ihrem Endgerät zu;
          Einzelheiten finden Sie im Abschnitt „Webanalyse“.
        </p>
        <h3>Rechtsgrundlage</h3>
        <p>
          Für unbedingt erforderliche Speicher- und Zugriffsvorgänge stützen wir uns auf § 25 Abs. 2
          Nr. 2 TDDDG; die damit verbundene Verarbeitung personenbezogener Daten erfolgt auf
          Grundlage unseres berechtigten Interesses gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO an einem
          sicheren und funktionsfähigen Angebot. Einwilligungsbedürftige Cookies oder vergleichbare
          Techniken setzen wir nicht ein.
        </p>

        <h2 id="analytics">Webanalyse</h2>
        <p>
          Zusätzlich zu den oben genannten Datenverarbeitungen nutzen wir ein Statistiksystem, das{" "}
          <strong>ohne Cookies betrieben wird</strong> und Nutzungsdaten ausschließlich in gekürzter
          Form verarbeitet, sodass ein Bezug zu Ihrer Person nach unserer Einschätzung nicht
          hergestellt werden kann. Aus Fairness- und Transparenzgründen legen wir die entsprechenden
          Details dennoch offen:
        </p>
        <p>
          Wir nutzen Matomo für statistische Zwecke, zur Verbesserung unserer Seite und zur
          Erkennung und Unterbindung von Missbrauch. Das Hosting für das Tool übernehmen wir selbst;
          die Auswertung erfolgt auf unserer eigenen Infrastruktur, eine Übermittlung an den
          Anbieter Matomo findet nicht statt. Matomo ist so konfiguriert, dass keine Cookies gesetzt
          und keine vergleichbaren Kennungen auf Ihrem Endgerät gespeichert oder ausgelesen werden.
          Erfasst werden nur die folgenden technischen Daten: die Website, von der aus Sie uns
          besuchen, die Seiten unserer Website, die Sie besuchen, das Datum und die Dauer Ihres
          Besuchs, Ihre anonymisierte (also gekürzte) IP-Adresse sowie einzelne Informationen über
          das von Ihnen verwendete Endgerät (Gerätetyp, Betriebssystem, Bildschirmauflösung,
          Sprache, Land, in dem Sie sich befinden, und Webbrowser-Typ). Der Datensatz, anhand dessen
          zusammengehörige Seitenaufrufe anonymisiert gruppiert werden, wird 30 Minuten nach Ende
          des Besuchs gelöscht.
        </p>
        <p>
          Die Kombination der oben aufgeführten Datenpunkte dürfte nicht genügen, um einen
          eindeutigen Bezug zu einer bestimmten Person herzustellen. Sie können der Erfassung durch
          Matomo dennoch jederzeit widersprechen; Einzelheiten finden Sie unten im Abschnitt
          „Widerspruch“.
        </p>
        <h3>Zweck der Verarbeitung</h3>
        <p>
          Die Verarbeitung dient der Erstellung von Nutzungsstatistiken, der bedarfsgerechten
          Gestaltung und Verbesserung unseres Angebots sowie der Erkennung und Unterbindung von
          Missbrauch.
        </p>
        <h3>Rechtsgrundlage</h3>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO an
          einer statistischen Auswertung der Nutzung unseres Angebots. Da Matomo ohne Cookies
          betrieben wird und keine Informationen auf Ihrem Endgerät gespeichert oder aus diesem
          ausgelesen werden, ist eine Einwilligung nach § 25 Abs. 1 TDDDG nicht erforderlich.
        </p>
        <h3>Empfänger</h3>
        <p>
          Ein Empfänger im Sinne des Art. 4 Nr. 9 DSGVO besteht nicht, da wir Matomo selbst
          betreiben. Die zugrunde liegenden Daten werden im Rahmen des Hostings und der
          Datenspeicherung bei den im Abschnitt „Eingesetzte Dienste und Empfänger“ genannten
          Auftragsverarbeitern IONOS SE und Amazon Web Services EMEA SARL gespeichert.
        </p>
        <h3>Drittlandübermittlung und Garantien</h3>
        <p>
          Nein; die Verarbeitung erfolgt in Deutschland beziehungsweise innerhalb der EU. Eine
          Übermittlung an den Anbieter Matomo oder in ein Drittland findet nicht statt.
        </p>
        <h3>Speicherdauer</h3>
        <p>Der Sitzungsdatensatz wird 30 Minuten nach Ende Ihres Besuchs gelöscht.</p>
        <p>
          Die zugrunde liegenden Rohdaten der Besuchsprotokolle löschen wir nach sechs Monaten;
          darüber hinaus bewahren wir ausschließlich aggregierte Statistiken ohne Personenbezug auf.
        </p>
        <h3>Widerspruch</h3>
        <p>
          Sie haben jederzeit das Recht, der Verarbeitung aus Gründen, die sich aus Ihrer besonderen
          Situation ergeben, gemäß Art. 21 Abs. 1 DSGVO zu widersprechen. Unabhängig davon können
          Sie die Erfassung durch Matomo für Ihren Besuch jederzeit über die nachfolgende Auswahl
          deaktivieren:
        </p>
        <MatomoIframe />

        <h2 id="contact">Kontaktmöglichkeiten</h2>
        <h3>Allgemeine Informationen</h3>
        <p>
          Über unsere Website weisen wir auf die Möglichkeit hin, uns per E-Mail zu kontaktieren. Im
          Rahmen der Kontaktaufnahme und Beantwortung Ihrer Anfrage verarbeiten wir folgende
          personenbezogene Daten von Ihnen:
        </p>
        <ul>
          <li>Name</li>
          <li>E-Mail</li>
          <li>Datum und Zeit der Anfrage</li>
          <li>Meta-Daten der E-Mail</li>
          <li>
            Weitere personenbezogene Daten, die Sie uns im Rahmen der Kontaktaufnahme mitteilen.
          </li>
        </ul>
        <h3>Zweck der Verarbeitung</h3>
        <p>
          Wir verarbeiten Ihre Daten zur Beantwortung Ihrer Anfrage sowie andere daraus
          resultierende Sachverhalte.
        </p>
        <h3>Rechtsgrundlage</h3>
        <p>
          Wenn Ihre Anfrage unabhängig von vertraglichen oder vorvertraglichen Maßnahmen erfolgt,
          stellen unsere überwiegenden berechtigten Interessen gem. Art. 6 Abs. 1 S. 1 lit. f DSGVO
          die Rechtsgrundlage dar. Das überwiegende berechtigte Interesse liegt in der
          Notwendigkeit, geschäftliche Korrespondenz zu beantworten. Steht Ihre Anfrage im
          Zusammenhang mit einem Vertrag oder mit vorvertraglichen Maßnahmen, ist Rechtsgrundlage
          Art. 6 Abs. 1 S. 1 lit. b DSGVO.
        </p>
        <h3>Empfänger</h3>
        <p>
          Für den Betrieb unserer E-Mail-Infrastruktur setzen wir die Migadu-Mail GmbH ein;
          Einzelheiten finden Sie im Abschnitt „Eingesetzte Dienste und Empfänger“. Eine Weitergabe
          an weitere Empfänger findet nicht statt, soweit sie nicht zur Bearbeitung Ihrer Anfrage
          erforderlich ist.
        </p>
        <h3>Speicherdauer</h3>
        <p>
          Wir löschen Ihre personenbezogenen Daten, sobald sie für die Erreichung des Zweckes der
          Erhebung nicht mehr erforderlich sind. Im Rahmen von Kontaktanfragen ist dies
          grundsätzlich dann der Fall, wenn sich aus den Umständen ergibt, dass der konkrete
          Sachverhalt abschließend bearbeitet ist. Darüber hinaus speichern wir E-Mails, sofern und
          solange sie gesetzlichen Aufbewahrungsfristen unterliegen.
        </p>

        <h2 id="newsletter">Newsletter</h2>
        <h3>Allgemeine Informationen</h3>
        <p>
          Wir bieten Ihnen die Möglichkeit, Ihre E-Mail-Adresse zu hinterlegen und sich für einen
          Newsletter anzumelden. Mit dem Newsletter informieren wir in Abstimmung mit den
          teilnehmenden Kommunen und in unregelmäßigen Abständen über Neuigkeiten und Informationen
          zu dem jeweiligen Projekt, zu dem Sie ein Beteiligungsformular ausgefüllt haben.
        </p>
        <p>Im Rahmen des Newsletterversands verarbeiten wir folgende personenbezogene Daten:</p>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>
            Metadaten (z. B. Geräteinformationen, IP-Adresse, Datum- und Uhrzeit der Anmeldung)
          </li>
        </ul>
        <h3>Newsletteranmeldung</h3>
        <p>
          Wenn Sie sich über unsere Website für den Newsletter anmelden, senden wir an die von Ihnen
          erstmalig für den Newsletterversand eingetragene E-Mail-Adresse eine Bestätigungsmail im
          Double-Opt-In-Verfahren. Diese Bestätigungsmail dient der Überprüfung, ob Sie als Inhaber
          der E-Mail-Adresse den Empfang des Newsletters autorisiert haben. Dabei wird die Anmeldung
          zum Newsletter protokolliert.
        </p>
        <h3>Newsletter-Tracking</h3>
        <p>
          Wenn dies nicht durch Ihr Mailprogramm unterbunden wird, erhalten wir unter anderem
          Empfangs- und Lesebestätigungen, wenn Sie den Newsletter öffnen. Wir erhalten außerdem
          Informationen über die Links, auf die Sie in unserem Newsletter geklickt haben. Dadurch
          sind wir in der Lage, Erfolg oder Misserfolg von Online-Marketing-Kampagnen statistisch
          auszuwerten. Die dadurch erhobenen personenbezogenen Daten werden von uns gespeichert und
          ausgewertet, um den Newsletterversand zu optimieren und den Inhalt zukünftiger Newsletter
          noch besser Ihren Interessen anzupassen.
        </p>
        <h3>Zweck der Verarbeitung</h3>
        <p>Wir verarbeiten Ihre personenbezogenen Daten für folgende Zwecke:</p>
        <ul>
          <li>Newsletterversand: Durchführung von Marketingmaßnahmen.</li>
          <li>Double-Opt-In-Verfahren: Erfüllung unserer gesetzlichen Nachweispflichten.</li>
          <li>Auswertung der Öffnungsrate und angeklickten Links.</li>
        </ul>
        <h3>Rechtsgrundlage</h3>
        <p>Die Rechtsgrundlage für die Verarbeitung Ihrer personenbezogenen Daten im Rahmen des</p>
        <ul>
          <li>Newsletter-Abonnements: Ihre Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a DSGVO;</li>
          <li>
            für die Auswertungen: Ebenso Ihre Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a DSGVO.
          </li>
        </ul>
        <h3>Speicherdauer</h3>
        <p>
          Wir löschen Ihre personenbezogenen Daten, sobald sie für die Erreichung des Zweckes der
          Erhebung nicht mehr erforderlich sind. Im Rahmen des Newslettersversand ist dies
          grundsätzlich dann der Fall, wenn Sie Ihre Einwilligung widerrufen oder Sie der
          Verarbeitung widersprechen.
          <br />
          In jedem Newsletter befindet sich daher ein entsprechender Opt-Out-Link. Zusätzlich
          besteht die Möglichkeit, sich jederzeit auch auf unserer Internetseite vom
          Newsletterversand abzumelden oder uns dies auf andere Weise mitzuteilen. Eine Abmeldung
          vom Erhalt des Newsletters deuten wir automatisch als Widerruf Ihrer Einwilligung
          beziehungsweise als Widerspruch gegen die Verarbeitung.
        </p>
        <p>
          Den Nachweis Ihrer Einwilligung, also das Protokoll der Anmeldung und der Bestätigung im
          Double-Opt-In-Verfahren, bewahren wir zur Erfüllung unserer Nachweispflichten bis zum
          Ablauf des dritten Kalenderjahres nach Ihrem Widerruf beziehungsweise Ihrer Abmeldung auf
          und löschen ihn anschließend.
        </p>
        <h3>Brevo GmbH (vormals Sendinblue GmbH)</h3>
        <ServiceDetails
          headingLevel={4}
          data="Bei der Nutzung des Dienstes werden folgende Daten verarbeitet: E-Mail-Adresse, gegebenenfalls Name, Anmeldezeitpunkt und IP-Adresse sowie Versand-, Zustell-, Öffnungs-, Klick- und Abmeldedaten"
          purpose="Newsletterversand, Double-Opt-in sowie Auswertung von Zustellung, Öffnungen und angeklickten Links"
          legalBasis="Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 Satz 1 lit. a DSGVO."
          recipient="Brevo GmbH (vormals Sendinblue GmbH), Köpenicker Straße 126, 10179 Berlin, Deutschland"
          thirdCountry="Ja, nicht auszuschließen; die Speicherung erfolgt innerhalb der EU, Drittlandzugriffe durch Unterauftragsverarbeiter können jedoch nicht vollständig ausgeschlossen werden. Auftragsverarbeitungsvertrag; bei Drittlandübermittlungen SCC gemäß Art. 46 DSGVO oder Angemessenheitsbeschluss gemäß Art. 45 DSGVO"
          storage="Kontaktdaten bis zum Widerruf beziehungsweise zur Abmeldung; Ereignisprotokolle 24 Monate"
        />

        <h2 id="rights">Ihre Rechte</h2>
        <h3>Recht auf Bestätigung</h3>
        <p>
          Sie haben das Recht, von uns eine Bestätigung darüber zu verlangen, ob Sie betreffende
          personenbezogene Daten verarbeitet werden.
        </p>
        <h3>Auskunft (Art. 15 DSGVO)</h3>
        <p>
          Sie haben das Recht, jederzeit von uns unentgeltliche Auskunft über die zu Ihrer Person
          gespeicherten personenbezogenen Daten sowie eine Kopie dieser Daten nach Maßgabe der
          gesetzlichen Bestimmungen zu erhalten.
        </p>
        <h3>Berichtigung (Art. 16 DSGVO)</h3>
        <p>
          Sie haben das Recht, die Berichtigung Sie betreffender unrichtiger personenbezogener Daten
          zu verlangen. Ferner steht Ihnen das Recht zu, unter Berücksichtigung der Zwecke der
          Verarbeitung, die Vervollständigung unvollständiger personenbezogener Daten zu verlangen.
        </p>
        <h3>Löschung (Art. 17 DSGVO)</h3>
        <p>
          Sie haben das Recht, von uns zu verlangen, dass die personenbezogenen Daten, die sie
          betreffen, unverzüglich gelöscht werden, wenn einer der gesetzlich vorgesehenen Gründe
          zutrifft und soweit die Verarbeitung bzw. Speicherung nicht erforderlich ist.
        </p>
        <h3>Einschränkung der Verarbeitung (Art. 18 DSGVO)</h3>
        <p>
          Sie haben das Recht, von uns die Einschränkung der Verarbeitung zu verlangen, wenn eine
          der gesetzlichen Voraussetzungen gegeben ist.
        </p>
        <h3>Datenübertragbarkeit (Art. 20 DSGVO)</h3>
        <p>
          Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie uns
          bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu
          erhalten. Weiterhin haben Sie das Recht, diese Daten einem anderen Verantwortlichen ohne
          Behinderung durch uns, dem die personenbezogenen Daten bereitgestellt wurden, zu
          übermitteln, sofern die Verarbeitung auf der Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a
          DSGVO oder Art. 9 Abs. 2 lit. a DSGVO oder auf einem Vertrag gem. Art. 6 Abs. 1 S. 1 lit.
          b DSGVO beruht und die Verarbeitung mithilfe automatisierter Verfahren erfolgt, sofern die
          Verarbeitung nicht für die Wahrnehmung einer Aufgabe erforderlich ist, die im öffentlichen
          Interesse liegt oder in Ausübung öffentlicher Gewalt erfolgt, welche uns übertragen wurde.
          <br />
          Zudem haben Sie bei der Ausübung Ihres Rechts auf Datenübertragbarkeit gem. Art. 20 Abs. 1
          DSGVO das Recht, zu erwirken, dass die personenbezogenen Daten direkt von einem
          Verantwortlichen an einen anderen Verantwortlichen übermittelt werden, soweit dies
          technisch machbar ist und sofern hiervon nicht die Rechte und Freiheiten anderer Personen
          beeinträchtigt werden.
        </p>
        <h3>Widerspruch (Art. 21 DSGVO)</h3>
        <p>
          <strong>
            Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
            jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die aufgrund
            einer Datenverarbeitung im öffentlichen Interesse gem. Art. 6 Abs. 1 S. 1 lit. e DSGVO
            oder auf Grundlage unseres berechtigten Interesses gem. Art. 6 Abs. 1 S. 1 lit. f DSGVO
            erfolgt, Widerspruch einzulegen.
          </strong>
          <br />
          Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten nicht mehr verarbeiten,
          es sei denn, wir können zwingende berechtigte Gründe für die Verarbeitung nachweisen, die
          Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der
          Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.
        </p>
        <p>
          Verarbeiten wir Ihre personenbezogenen Daten zum Zwecke der Direktwerbung, insbesondere
          für den Versand unseres Newsletters, haben Sie gemäß Art. 21 Abs. 2 DSGVO das Recht,
          dieser Verarbeitung jederzeit und ohne Angabe von Gründen zu widersprechen; wir werden
          Ihre personenbezogenen Daten dann für diese Zwecke nicht mehr verarbeiten.
        </p>
        <h3>Widerruf einer datenschutzrechtlichen Einwilligung</h3>
        <p>
          Sie haben das Recht, Ihre Einwilligung zur Verarbeitung personenbezogener Daten jederzeit
          mit Wirkung für die Zukunft zu widerrufen.
        </p>
        <h3>Erforderlichkeit der Bereitstellung Ihrer Daten</h3>
        <p>
          Die Bereitstellung Ihrer personenbezogenen Daten ist grundsätzlich weder gesetzlich noch
          vertraglich vorgeschrieben. Für die Einrichtung und Nutzung eines Zugangs zum internen
          Bereich sind die als Pflichtfeld gekennzeichneten Angaben jedoch erforderlich; ohne diese
          Angaben können wir Ihnen keinen Zugang einrichten. Für die Beantwortung einer Anfrage
          benötigen wir die zur Kontaktaufnahme erforderlichen Angaben, für den Versand des
          Newsletters Ihre E-Mail-Adresse. Im Übrigen ist die Bereitstellung freiwillig und eine
          Nichtbereitstellung hat für Sie keine Nachteile.
        </p>
        <h3>Keine automatisierte Entscheidungsfindung</h3>
        <p>
          Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne des Art. 22
          DSGVO findet nicht statt.
        </p>
        <h3>Beschwerde bei einer Aufsichtsbehörde</h3>
        <p>
          Sie haben das Recht, sich bei einer für Datenschutz zuständigen Aufsichtsbehörde über
          unsere Verarbeitung personenbezogener Daten zu beschweren.
        </p>
        <p>
          Die zuständige Datenschutzaufsichtsbehörde für die FixMyCity GmbH ist die Berliner
          Beauftragte für Datenschutz und Informationsfreiheit, die Sie wie folgt kontaktieren
          können:
        </p>
        <p>
          <strong>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong>
          <br />
          Anschrift: Alt-Moabit 60, 10555 Berlin
          <br />
          Tel.: <LinkTel>+49 30 13889-0</LinkTel>
          <br />
          E-Mail: <LinkMail>mailbox@datenschutz-berlin.de</LinkMail>
        </p>

        <h2 id="updates">Aktualität und Änderungen der Datenschutzhinweise</h2>
        <p>
          Diese Datenschutzhinweise sind aktuell gültig und haben den folgenden Stand: September
          2026.
        </p>
        <p>
          Wenn wir unsere Website und unsere Angebote weiterentwickeln oder sich gesetzliche oder
          behördliche Vorgaben ändern, kann es notwendig sein, diese Datenschutzhinweise zu ändern.
          Die jeweils aktuellen Datenschutzhinweise können Sie jederzeit hier abrufen.
        </p>
      </div>
    </>
  )
}
