import { Link, LinkMail, LinkTel } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TableOfContents } from "@/src/datenschutz/components/TableOfContents/TableOfContents"
import { TocHashLink } from "@/src/datenschutz/components/TableOfContents/types"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Datenschutzerklärung",
}

const tocItems: TocHashLink = [
  ["#intro", "Einleitung"],
  ["#responsible", "Verantwortlichkeit"],
  ["#hosting", "Bereitstellung"],
  ["#analytics", "Webanalyse"],
  ["#youtube", "YouTube"],
  ["#contact", "Kontaktmöglichkeiten"],
  ["#newsletter", "Newsletter"],
  ["#rights", "Ihre Rechte"],
  ["#updates", "Aktualität & Änderungen"],
]

const MatomoIframe = () => {
  return (
    <iframe
      title="Matomo Opt Out Tracking"
      className="h-52 w-full border bg-[#f0fdf4] p-2"
      src="https://s.fixmycity.de/index.php?module=CoreAdminHome&action=optOut&language=de&backgroundColor=f0fdf4&fontColor=374151&fontSize=16px&fontFamily=Arial"
    />
  )
}

export default function DatenschutzPage() {
  return (
    <>
      <PageHeader title="Datenschutzerklärung" />

      <h2 id="intro">Einleitung</h2>
      <p>
        Mit den nachfolgenden Informationen wollen wir Ihnen einen Überblick über die Verarbeitung
        Ihrer personenbezogenen Daten auf unserer Website trassenscout.de (nachfolgend „Website“
        genannt) geben. Wir wollen Sie ebenfalls über Ihre Rechte aus dem Datenschutzrecht
        informieren. Die Verarbeitung Ihrer personenbezogenen Daten durch uns erfolgt stets im
        Einklang mit der Datenschutzgrundverordnung (nachfolgend „DSGVO“ genannt) sowie allen
        geltenden landesspezifischen Datenschutzbestimmungen.
      </p>
      <TableOfContents items={tocItems} />
      <h2 id="responsible">Verantwortlichkeit</h2>
      <h3>Verantwortlich im Sinne der DSGVO</h3>
      <p>
        <strong>FixMyCity GmbH</strong> <br />
        Oberlandstraße 26-35 <br />
        12099 Berlin <br />
        E-Mail: <LinkMail>hello@fixmycity.de</LinkMail> <br />
        Telefon: <LinkTel>+40 30 549 08 665</LinkTel>
      </p>
      <h3>Datenschutzbeauftragter</h3>
      <p>Unsere Datenschutzbeauftragten erreichen Sie wie folgt:</p>
      <p>
        <strong>secjur GmbH</strong> <br />
        Niklas Hanitsch <br />
        Steinhöft 9<br />
        20459 Hamburg <br />
        E-Mail: <LinkMail>dsb@secjur.com</LinkMail> <br />
        Telefon: <LinkTel>+49 40 228 599 520</LinkTel>
      </p>
      <p>
        Sie können sich jederzeit bei allen Fragen und Anregungen zum Datenschutz sowie zur Ausübung
        Ihrer Rechte direkt an unseren Datenschutzbeauftragten wenden.
      </p>

      <h3 id="thirdparty">Einsatz von Drittdiensten</h3>
      <p>
        Für bestimmte Funktionen und Services auf unserer Website setzen wir Dienste von
        Drittanbietern ein. Die konkreten Dienste können jeweils den entsprechenden Kapiteln
        entnommen werden.
      </p>
      <p>
        Teilweise setzen wir Dienstleister ein, die ihren Sitz in einem Drittland haben, also
        außerhalb der EU. Wir übermitteln Daten nur in ein Drittland, in denen ein angemessenes
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
        Möglichkeit, das (anonyme) Feedback in einem internen Bereich einzusehen und sich intern zu
        den jeweiligen Projekten mit weiteren Interessengruppen auszutauschen. Art und Umfang der
        personenbezogenen Daten, die durch uns verarbeitet werden, unterscheiden sich teilweise; je
        nachdem, ob Sie den öffentlichen oder den nicht-öffentlichen Bereich nutzen.
      </p>

      <h3>Allgemeine Informationen</h3>
      <p>
        Beim Besuch unseres Portals werden automatisch Daten verarbeitet, die Ihr Browser an unseren
        Server übermittelt. Diese allgemeinen Daten und Informationen werden in den Logfiles des
        Servers gespeichert (in sog. „Server-Logfiles“). Erfasst werden können die
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
        Wenn Sie eines unserer Beteiligungsformulare nutzen und Ihre Eingaben absenden, verarbeiten
        wir zusätzliche folgende Datenkategorien:
      </p>
      <ul>
        <li>Angaben zur Nutzung des Trassenabschnitts</li>
        <li>Angabe zum betroffenen Streckenabschnitt</li>
        <li>Inhalt von Freitextfelder</li>
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
        Teilnahme an der Beteiligungsbefragung kontaktiert. Wenn Sie als Teil dieser Befragung and
        der Beteiligung teilnehmen, werden – zusätzlich zu den obig aufgeführten, anonymisierten
        Daten, noch folgende personenbezogenen Daten von uns erhoben:
      </p>
      <ul>
        <li>E-Mail-Adresse</li>
        <li>Name, Vorname</li>
        <li>Name der Institution des Befragten</li>
      </ul>
      <p>
        Die Speicherung dieser Daten ist für den ordnungsgemäßen Ablauf der Beteiligung notwendig,
        da Rückfragen zu den Befragungsergebnissen auftreten können. Die Verarbeitung dieser Daten
        stützen wir auf Ihre ausdrückliche, uns im Rahmen der Befragung erteilte Einwilligung gemäß
        Art. 6 Abs. 1 lit. a. DSGVO. Wir versenden die Einladungen zu der Beteiligungsbefragung über
        E-Mail. Für den Versand der Einladungen nutzen wir einen externen Anbieter, Mailjet
        (Alt-Moabit 2, 10557 Berlin, Deutschland). Dieser Dienstleister erhält Ihre E-Mail-Adresse
        und andere erforderliche Daten, um die Einladung in unserem Auftrag zu versenden.
        Rechtsgrundlage für den Versand des Newsletters ist der Art. 6 Abs. 1 S. 1 lit. a. DSGVO,
        Art. 6 Abs. 1 S. 1 lit. f. DSGVO). Mailjet gibt an, Webspace von Google zu beziehen,
        spezifiziert aber nicht, ob es sich um Server innerhalb der EU handelt. Es ist daher nicht
        auszuschließen, dass die personenbezogenen Daten jedenfalls teilweise in die USA übermittelt
        werden. Mailjet ist nicht nach dem Data Privacy Framework zertifiziert.
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
          Wenn als Projektmanager:in zugewiesen: Projektbeschreibungen (inkl. geologischer Angaben)
        </li>
        <li>Kontaktdaten und Termine</li>
        <li>Notizen soweit diese personenbezogen Daten enthalten</li>
        <li>Hochgeladene Dateien soweit diese personenbezogene Daten enthalten</li>
      </ul>

      <h3>Zweck der Verarbeitung</h3>
      <p>
        Bei der Nutzung dieser allgemeinen Daten und Informationen ziehen wir keine Rückschlüsse auf
        Ihre Person. Zu den von uns verfolgten Zwecken gehört insbesondere:
      </p>
      <ul>
        <li>
          die Gewährleistung eines reibungslosen Verbindungsaufbaus der Website und Bereitstellung
          des Portals,
        </li>
        <li>Aufbereitung und Zusammenfassung der Beteiligungsbögen,</li>
        <li>die Aufklärung von Missbrauchs- oder Betrugshandlungen,</li>
        <li>Problemanalysen im Netzwerk, sowie</li>
        <li>die Auswertung der Systemsicherheit und -stabilität.</li>
      </ul>
      <h3>Rechtsgrundlage</h3>
      <p>
        Die Rechtsgrundlage für die Datenverarbeitung ist unser berechtigtes Interesse im Sinne des
        Art. 6 Abs. 1 S. 1 lit. f DSGVO. Wir haben ein überwiegendes berechtigtes Interesse daran,
        unser Angebot (technisch einwandfrei) anbieten zu können.
      </p>
      <h3>Speicherdauer</h3>
      <p>
        Die Logfiles werden aus Sicherheitsgründen durch den Auftragsverarbeiter (siehe unten, z.B.
        zur Aufklärung von Missbrauchs- oder Betrugshandlungen) für die Dauer von maximal 30 Tagen
        gespeichert und danach gelöscht. Daten, deren weitere Aufbewahrung zu Beweiszwecken
        erforderlich ist, werden bis zur endgültigen Klärung der Angelegenheit aufbewahrt.
        Registrierungsdaten werden gelöscht, sobald der Account und Inhalte werden in
        personenbezogener Form bis zur Löschung des Accounts.
      </p>
      <h3>Empfänger personenbezogener Daten</h3>
      <p>Wir setzen folgende Dienstleister ein:</p>
      <table>
        <thead>
          <tr>
            <th>Anbieter</th>
            <th>Anschrift</th>
            <th>Drittland</th>
            <th>Geeignete Garantie</th>
            <th>Zweck</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="align-text-top">MapTiler AG</th>
            <td>Hüfnerstrasse 98, Unterägeri, Zug 6314, Schweiz</td>
            <td>Ja, Schweiz</td>
            <td>
              <Link
                blank
                href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32000D0518&from=EN"
              >
                Angemessenheitsbeschluss der EU-Kommission
              </Link>
            </td>
            <td>Bereitstellung und Übermittlung von Kartenmaterial</td>
          </tr>
          <tr>
            <th className="align-text-top">Amazon Web Services, Inc.</th>
            <td>38 Avenue John F. Kennedy, L-1855 Luxembourg</td>
            <td>
              Serverstandort Frankfurt. Ein ausnahmsweiser Zugriff aus den USA kann nicht
              ausgeschlossen werden (z.B. zu Wartungszwecken oder Fehlersuche).
            </td>
            <td>
              Dennoch{" "}
              <Link blank href="https://d1.awsstatic.com/legal/aws-gdpr/AWS_GDPR_DPA.pdf">
                Standard&shy;datenschutz&shy;klauseln abgeschlossen
              </Link>
            </td>
            <td>Hosting der Website und Bereitstellung der Inhalte</td>
          </tr>
          <tr>
            <th className="align-text-top">IONOS SE</th>
            <td>Elgendorfer Str. 57, 56410 Montabaur, Deutschland</td>
            <td>-</td>
            <td>-</td>
            <td>Hosting der Website und Bereitstellung der Inhalte</td>
          </tr>
          <tr>
            <th className="align-text-top">Mailjet GmbH</th>
            <td>Alt-Moabit 2, 10557 Berlin, Germany</td>
            <td>
              Serverstandorte Frankfurt und Saint-Ghislain (Belgien). Ein ausnahmsweiser Zugriff aus
              den USA kann nicht ausgeschlossen werden (z.B. zu Wartungszwecken oder Fehlersuche).
            </td>
            <td>
              Dennoch{" "}
              <Link blank href="https://www.mailjet.com/de/rechtliches/av-vertrag/">
                Standard&shy;datenschutz&shy;klauseln abgeschlossen
              </Link>
              .
            </td>
            <td>Bereitstellung von Registrierungslinks und Benachrichtigungen</td>
          </tr>
          <tr>
            <th className="align-text-top">SCALEWAY</th>
            <td>8 rue de la Ville l&lsquo;Ev&ecirc;que, 75008 Paris, Frankreich</td>
            <td>-</td>
            <td>-</td>
            <td>Backup</td>
          </tr>
        </tbody>
      </table>
      <h2 id="analytics">Webanalyse</h2>
      <p>
        Zusätzlich zu den oben genannten Datenverarbeitungen nutzen wir ein Statistiksystem, das{" "}
        <strong>keine personenbezogenen Daten</strong> verarbeitet. Aus Fairness- und
        Transparenzgründen haben wir uns dennoch entschieden, die entsprechenden Details dazu
        offenzulegen:
      </p>
      <p>
        Wir nutzen Matomo für statistische Zwecke, zur Verbesserung unserer Seite und zur Erkennung
        und Unterbindung von Missbrauch. Das Hosting für das Tool übernehmen wir selbst. Matomo ist
        so konfiguriert, dass nur die folgenden technische Daten erfasst werden: Die Website, von
        der aus Sie uns besuchen, die Seiten unserer Website, die Sie besuchen, das Datum und die
        Dauer Ihres Besuchs, Ihre anonymisierte (also gekürzte) IP-Adresse und einzelne
        Informationen über das von Ihnen verwendete Endgeräte (Gerätetyp, Betriebssystem,
        Bildschirmauflösung, Sprache, Land, in dem Sie sich befinden, und Webbrowser-Typ). Der
        Datensatz, anhand dessen zusammengehörige Seitenaufrufe anonymisiert gruppiert werden, wird
        30 Minuten nach Ende des Besuchs gelöscht.
      </p>
      <p>
        Die Kombination der oben aufgeführten Datenpunkte dürfte nicht genügen, um einen eindeutigen
        Bezug zu einer bestimmten Person herzustellen. Sie können trotzdem die Verwendung von Matomo
        während Ihres Besuchs durch Abwahl des folgenden Hakens unterbinden:
      </p>
      <MatomoIframe />
      <h2 id="youtube">YouTube</h2>
      <h3>Allgemeine Information</h3>
      <p>
        Wir binden Videos auf unserer Plattform ein, die bei YouTube gespeichert sind. Diese sind
        jedoch nicht automatisch verfügbar, sondern müssen erst durch aktive Bestätigung durch Sie
        freigegeben werden. Dabei können personenbezogene Daten an Google übertragen werden,
        beispielsweise Ihre IP-Adresse und weitere Nutzungsdaten.
      </p>
      <h3>Zweck der Verarbeitung</h3>
      <p>
        Der Zweck der Verarbeitung ist die Anzeige von Videos, die zum einen über das Angebot
        informieren und zum anderen die Nutzung des Angebots erklären sollen.
      </p>
      <h3>Rechtsgrundlage</h3>
      <p>
        Die Rechtsgrundlage für die Datenverarbeitung ist Ihre Einwilligung gem. Art. 6 Abs. 1 S. 1
        lit. a DSGVO.
      </p>
      <h3>Empfänger</h3>
      <p>
        Google Cloud EMEA Limited, 70 Sir John Rogerson&lsquo;s Quay, Dublin 2, Irland. Weiter
        Informationen erhalten Sie in der Datenschutzerklärung von Google:{" "}
        <Link blank href="https://policies.google.com/privacy?hl=de">
          policies.google.com/privacy
        </Link>
      </p>

      <h2 id="contact">Kontaktmöglichkeiten</h2>
      <h3>Allgemeine Informationen</h3>
      <p>
        Über unsere Website weisen wir auf die Möglichkeit hin, uns per E-Mail zu kontaktieren.Im
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
        Wir verarbeiten Ihre Daten zur Beantwortung Ihrer Anfrage sowie andere daraus resultierende
        Sachverhalte.
      </p>
      <h3>Rechtsgrundlage</h3>
      <p>
        Wenn Ihre Anfrage unabhängig von vertraglichen oder vorvertraglichen Maßnahmen erfolgt,
        stellen unsere überwiegenden berechtigten Interessen gem. Art. 6 Abs. 1 S. 1 lit. f DSGVO
        die Rechtsgrundlage dar. Das überwiegende berechtigte Interesse liegt in der Notwendigkeit,
        geschäftliche Korrespondenz zu beantworten.
      </p>
      <h3>Speicherdauer</h3>
      <p>
        Wir löschen Ihre personenbezogenen Daten, sobald sie für die Erreichung des Zweckes der
        Erhebung nicht mehr erforderlich sind. Im Rahmen von Kontaktanfragen ist dies grundsätzlich
        dann der Fall, wenn sich aus den Umständen ergibt, dass der konkrete Sachverhalt
        abschließend bearbeitet ist. Darüber hinaus speichern wir E-Mails, sofern und solange sie
        gesetzlichen Aufbewahrungsfristen unterliegen.
      </p>

      <h2 id="newsletter">Newsletter</h2>
      <h3>Allgemeine Informationen</h3>
      <p>
        Wir bieten Ihnen die Möglichkeit, Ihre E-Mail-Adresse zu hinterlegen und sich für einen
        Newsletter anzumelden. Mit dem Newsletter informieren wir in Abstimmung mit den
        teilnehmenden Kommunen und in unregelmäßigen Abständen über Neuigkeiten und Informationen zu
        dem jeweiligen Projekt, zu dem Sie ein Beteiligungsformular ausgefüllt haben.
      </p>
      <p>Im Rahmen des Newsletterversands verarbeiten wir folgende personenbezogene Daten:</p>
      <ul>
        <li>E-Mail-Adresse</li>
        <li>Metadaten (z. B. Geräteinformationen, IP-Adresse, Datum- und Uhrzeit der Anmeldung)</li>
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
        Informationen über die Links, auf die Sie in unserem Newsletter geklickt haben. Dadurch sind
        wir in der Lage, Erfolg oder Misserfolg von Online-Marketing-Kampagnen statistisch
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
        grundsätzlich dann der Fall, wenn Sie Ihre Einwilligung widerrufen oder Sie der Verarbeitung
        widersprechen.
        <br />
        In jedem Newsletter befindet sich daher ein entsprechender Opt-Out-Link. Zusätzlich besteht
        die Möglichkeit, sich jederzeit auch auf unserer Internetseite vom Newsletterversand
        abzumelden oder uns dies auf andere Weise mitzuteilen. Eine Abmeldung vom Erhalt des
        Newsletters deuten wir automatisch als Widerruf oder Widerruf.
      </p>
      <h3>Empfänger personenbezogener Daten</h3>
      <p>Wir setzen folgenden Dienstleister ein:</p>
      <table>
        <thead>
          <tr>
            <th>Anbieter</th>
            <th>Anschrift</th>
            <th>Drittland</th>
            <th>Geeignete Garantie</th>
            <th>Zweck</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="align-text-top">Mailjet GmbH</th>
            <td>Alt-Moabit 2, 10557 Berlin, Germany</td>
            <td>
              Serverstandorte Frankfurt und Saint-Ghislain (Belgien). Ein ausnahmsweiser Zugriff aus
              den USA kann nicht ausgeschlossen werden (z.B. zu Wartungszwecken oder Fehlersuche).
            </td>
            <td>
              Dennoch{" "}
              <Link blank href="https://www.mailjet.com/de/rechtliches/av-vertrag/">
                Standard&shy;datenschutz&shy;klauseln abgeschlossen
              </Link>
            </td>
            <td>
              Versand von Newslettern, Durchführung des Double-Opt-Ins, Auswertung der Öffnungsrate
            </td>
          </tr>
        </tbody>
      </table>
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
        Sie haben das Recht, von uns die Einschränkung der Verarbeitung zu verlangen, wenn eine der
        gesetzlichen Voraussetzungen gegeben ist.
      </p>
      <h3>Datenübertragbarkeit (Art. 20 DSGVO)</h3>
      <p>
        Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie uns
        bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu
        erhalten. Weiterhin haben Sie das Recht, diese Daten einem anderen Verantwortlichen ohne
        Behinderung durch uns, dem die personenbezogenen Daten bereitgestellt wurden, zu
        übermitteln, sofern die Verarbeitung auf der Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a
        DSGVO oder Art. 9 Abs. 2 lit. a DSGVO oder auf einem Vertrag gem. Art. 6 Abs. 1 S. 1 lit. b
        DSGVO beruht und die Verarbeitung mithilfe automatisierter Verfahren erfolgt, sofern die
        Verarbeitung nicht für die Wahrnehmung einer Aufgabe erforderlich ist, die im öffentlichen
        Interesse liegt oder in Ausübung öffentlicher Gewalt erfolgt, welche uns übertragen wurde.
        <br />
        Zudem haben Sie bei der Ausübung Ihres Rechts auf Datenübertragbarkeit gem. Art. 20 Abs. 1
        DSGVO das Recht, zu erwirken, dass die personenbezogenen Daten direkt von einem
        Verantwortlichen an einen anderen Verantwortlichen übermittelt werden, soweit dies technisch
        machbar ist und sofern hiervon nicht die Rechte und Freiheiten anderer Personen
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
      <h3>Widerruf einer datenschutzrechtlichen Einwilligung</h3>
      <p>
        Sie haben das Recht, Ihre Einwilligung zur Verarbeitung personenbezogener Daten jederzeit
        mit Wirkung für die Zukunft zu widerrufen.
      </p>
      <h3>Beschwerde bei einer Aufsichtsbehörde</h3>
      <p>
        Sie haben das Recht, sich bei einer für Datenschutz zuständigen Aufsichtsbehörde über unsere
        Verarbeitung personenbezogener Daten zu beschweren.
      </p>
      <p>
        Die zuständige Datenschutzaufsichtsbehörde für die FixMyCity GmbH ist die Berliner
        Beauftragte für Datenschutz und Informationsfreiheit, die Sie wie folgt kontaktieren können:
      </p>
      <p>
        <strong>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong> <br />
        Anschrift: Alt-Moabit 60, 10555 Berlin
        <br />
        Tel.: <LinkTel>+49 30 13889-0</LinkTel>
        <br />
        E-Mail: <LinkMail>mailbox@datenschutz-berlin.de</LinkMail>
      </p>
      <h2 id="updates">Aktualität und Änderungen der Datenschutzhinweise</h2>
      <p>
        Diese Datenschutzhinweise sind aktuell gültig und haben den folgenden Stand: Februar 2023.
      </p>
      <p>
        Wenn wir unsere Website und unsere Angebote weiterentwickeln oder sich gesetzliche oder
        behördliche Vorgaben ändern, kann es notwendig sein, diese Datenschutzhinweise zu ändern.
        Die jeweils aktuellen Datenschutzhinweise können Sie jederzeit hier abrufen.
      </p>
    </>
  )
}
