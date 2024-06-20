import clsx from "clsx"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect } from "react"
import institutions_bboxes from "src/survey-public/radnetz-brandenburg/data/institutions_bboxes.json"
import { SurveyMainPage } from "../components/SurveyMainPage"
import { SurveyH1, SurveyH2, SurveyH3, SurveyP } from "../components/core/Text"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import {
  partcipationLinkStyles,
  primaryColorButtonStylesForLinkElement,
  surveyPrimaryColorButtonStyles,
} from "../components/core/links/styles"
import AtlasImage from "./data/Startseite_Platzhalter_Radverkehrstlas.png"
import { emailDefinition } from "./data/email"
import { feedbackDefinition } from "./data/feedback"
import { moreDefinition } from "./data/more"
import { stageProgressDefinition } from "./data/progress"
import { responseConfig } from "./data/response-config"
import { surveyDefinition } from "./data/survey"
import { SurveyLink } from "../components/core/links/SurveyLink"
import { isProduction } from "src/core/utils"
import { set } from "date-fns"

type Props = {
  surveyId: number
}

const StartContent: React.FC = () => {
  let [isOpen, setIsOpen] = useState(false)

  const closeModal = () => {
    setIsOpen(false)
  }

  const openModal = () => {
    setIsOpen(true)
  }

  return (
    <>
      <SurveyH1>
        Beteiligung der Kommunen zur Erstellung des „Radnetz Brandenburg“-Konzeptes
      </SurveyH1>
      <SurveyP>
        Mit dem <strong>Radnetz Brandenburg</strong> wird ein Konzept für ein umfassendes und
        komfortabel befahrbares Wegenetz für den Alltagsverkehr – unter Einbezug der touristischen
        Radrouten – erstellt. Das baulastträgerübergreifende Radnetz-Konzept soll dazu dienen, für
        die kommenden Jahre eine neue Grundlage für die Bedarfsplanung zu haben, Prozesse zur
        Priorisierung und Umsetzung unter den Baulastträgern zu optimieren sowie sukzessive
        vorhandene Infrastrukturen zu ertüchtigen und vor allem Netzlücken zu schließen. Mit dem
        Konzept sollen im Ergebnis durchgängige Radverkehrsverbindungen und somit die Grundlage für
        eine zukünftige flächendeckende Erschließung des Landes Brandenburg mit Infrastruktur für
        den Radverkehr geschaffen werden.
      </SurveyP>
      <SurveyP>
        Hierfür wurden zuerst <strong>Quellen und Ziele</strong> des Alltagsradverkehrs
        identifiziert und in einem <strong>Luftliniennetz</strong> miteinander verknüpft. Diese
        orientieren sich zum Beispiel an den Ober- und Mittelzentren, den Grundfunktionalen
        Schwerpunkten, Bahnhöfen und weiteren regionalen Schwerpunkten, wie beispielsweise wichtige
        touristische Destinationen. In einem nächsten Schritt wird ein <strong>Zielnetz</strong>{" "}
        entwickelt, in dem das Luftliniennetz auf das bestehende Wegenetz umgelegt wird und so auch
        wichtige Lückenschlüsse identifiziert werden. Dabei werden auch weitere wichtige Standorte
        wie zum Beispiel Schulen und Versorgungsstandorte berücksichtigt. Die Konzeption betrachtet
        grundsätzlich alle bestehenden Infrastrukturen und Wegeverbindungen, unter anderem
        straßenbegleitende und selbständige Radwege, Wirtschaftswege, touristische Radrouten und
        innerörtliche Straßen. So weit wie möglich wird auf die vorhandene Infrastruktur
        zurückgegriffen.
      </SurveyP>
      <SurveyP>
        Weiterführende Informationen zum Radnetz Brandenburg finden Sie auf der Website des
        Ministeriums für{" "}
        <a
          className={partcipationLinkStyles}
          target="_blank"
          href="https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/radnetz-brandenburg/"
        >
          Infrastruktur und Landesplanung
        </a>
        .
      </SurveyP>
      <SurveyH2>
        Bitte geben Sie uns Ihre Rückmeldungen und bringen Ihr lokales Wissen im Zielnetzentwurf mit
        ein! Vielen Dank dafür.{" "}
      </SurveyH2>
      <SurveyP>
        Der erste <strong>Entwurf eines Zielnetzes</strong> für das Radnetz Brandenburg liegt nun
        vor. Um Ihre Vor-Ort-Expertise und Bedürfnisse als kommunale Baulastträger zu
        berücksichtigen und somit ein bestmögliches Zielnetz entwickeln zu können, ist Ihre
        Rückmeldung von großer Bedeutung. Daher haben Sie im Zeitraum{" "}
        <strong>vom 16. August bis zum 20. September 2024</strong> die Möglichkeit, den Entwurf des
        Radnetzkonzeptes zu kommentieren.{" "}
      </SurveyP>
      <SurveyH3>So geht’s!</SurveyH3>
      <ul className="list-disc ml-6">
        <li>
          Schauen Sie sich vorab zunächst den Zielnetzentwurf im Radverkehrsatlas an. Starten Sie
          erst dann die Beteiligung.{" "}
        </li>
        <li>
          Zuerst müssen Sie sich bitte mit Namen, E-Mail-Adresse und PIN registrieren. Das Feld
          „angemeldet als“ wird dabei automatisch ausgefüllt.{" "}
        </li>
        <li>
          Bevor Sie zur Beteiligung gelangen, möchten wir Sie bitten, zum Einstieg eine kurze
          Umfrage mit zwei allgemeinen Fragen zu beantworten.{" "}
        </li>
        <li>
          Anschließend können Sie im Rahmen der Beteiligung zu den einzelnen Verbindungen Ihre
          Rückmeldung geben.{" "}
        </li>
        <li>
          Während der Laufzeit der Beteiligung können Sie oder Ihre Kolleginnen und Kollegen
          jederzeit weitere Hinweise ergänzen.{" "}
        </li>
        <li>Ihre eingetragenen Hinweise erhalten Sie im Nachgang per E-Mail als Bestätigung. </li>
      </ul>
      <SurveyH2>Zielnetzentwurf im Radverkehrsatlas ansehen</SurveyH2>
      <SurveyP>
        Unter dem unten stehenden Link können Sie sich den Zielnetzentwurf im{" "}
        <i>
          <strong>Radverkehrsatlas</strong>
        </i>{" "}
        anschauen. Bitte beachten Sie, dass es sich hierbei um einen Entwurf handelt. Die
        vorgeschlagenen Verbindungen können sich, je nach Rückmeldungen seitens der Beteiligten,
        noch ändern.
      </SurveyP>
      <SurveyP>
        Im Radverkehrsatlas sind auch die gesammelten Daten zur Bestandsinfrastruktur und zu
        Radrouten, verschiedene Daten aus OpenStreetMap sowie das Luftliniennetz einsehbar. Eine
        Anleitung zur Nutzung des Radverkehrsatlasses finden Sie{" "}
        <a
          target="_blank"
          href={
            isProduction
              ? "https://trassenscout.de/radnetz-brandenburg/anleitung-radverkehrsatlas-beteiligung-bb.pdf"
              : "https://staging.trassenscout.de/radnetz-brandenburg/anleitung-radverkehrsatlas-beteiligung-bb.pdf"
          }
          className={partcipationLinkStyles}
        >
          hier
        </a>
        .
      </SurveyP>
      <SurveyP>
        Der Radverkehrsatlas öffnet sich in einem neuen Tab. Kehren Sie anschließend hier zur
        Beteiligung zurück.
      </SurveyP>
      <button
        type="button"
        onClick={openModal}
        className="w-full md:h-[480px] overflow-hidden flex justify-center items-center my-8 relative"
      >
        <Image
          src={AtlasImage}
          alt="Radverkehrsatlas Land Brandenburg"
          className="object-cover w-full"
        />
        <div className="font-semibold mx-8 max-w-[365px] bg-white/80 p-4 px-8 text-center absolute bottom-[45%] font-sans">
          Schauen Sie sich den gesamten{" "}
          <span className={partcipationLinkStyles}>Zielnetzentwurf im Radverkehrsatlas</span> an.
        </div>
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex items-center justify-center z-10"
          onClose={closeModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-700">
                    Achtung:
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      Durch Aufrufen der Seite bestätige ich, dass der Link zum Radverkehrsatlas und
                      die enthaltenen Daten<b> vertraulich</b> behandelt und nicht an unbefugte
                      Dritte weitergegeben werden.{" "}
                    </p>
                  </div>

                  <div className="mt-4">
                    <a
                      href="https://radverkehrsatlas.de/regionen/bb-beteiligung?v=1&map=11/52.397/13.034&config=!(i~bikelanes-minimal~a~~sc~!(i~bikelanes~s~!(i~hidden~a~_F)(i~default~a)(i~details~a~_F)(i~width~a~_F)))(i~poi~a~_F~sc~!(i~poi~s~!(i~hidden~a~_F)(i~default~a)(i~education~a~_F))(i~poiPlaces~s~!(i~hidden~a~_F)(i~default~a)(i~circle~a~_F))(i~poiBoundaries~s~!(i~hidden~a)(i~default~a~_F)(i~category*_district*_label~a~_F)(i~category*_municipality~a~_F)(i~category*_municipality*_label~a~_F))(i~poiPlusBarriers~s~!(i~default~a~_F))(i~poiPlusLanduse~s~!(i~default~a~_F))(i~poiPlusPublicTransport~s~!(i~default~a~_F)))(i~roads~a~_F~sc~!(i~roads~s~!(i~hidden~a~_F)(i~default~a)(i~sidestreets~a~_F)(i~mainstreets~a~_F))(i~maxspeed~s~!(i~hidden~a)(i~default~a~_F)(i~below30~a~_F)(i~above40~a~_F))(i~roads*_plus*_footways~s~!(i~default~a~_F)))(i~mapillary~a~_F~sc~!(i~mapillaryCoverage~s~!(i~hidden~a~_F)(i~default~a)(i~all~a~_F)(i~age~a~_F)(i~pano~a~_F)))~"
                      target="_blank"
                      className={primaryColorButtonStylesForLinkElement}
                      onClick={closeModal}
                    >
                      Einverstanden
                    </a>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className={surveyPrimaryColorButtonStyles}
                      onClick={closeModal}
                    >
                      Nein, ich bleibe hier
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <SurveyP>
        Mit dem Aufrufen der Beteiligung stimme ich der{" "}
        <SurveyLink blank href="/datenschutz">
          Datenschutzerklärung
        </SurveyLink>{" "}
        zu. Die Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieser Beteiligung
        gespeichert.
      </SurveyP>
      <details>
        <summary
          className={clsx(
            partcipationLinkStyles,
            "cursor-pointer mb-4 mt-8 text-lg font-extrabold",
          )}
        >
          Häufige Fragen
        </summary>
        <ul className={clsx("mb-8 space-y-2")}>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Was bedeutet baulasträgerübergreifendes Radnetz?
              </summary>
              Beim <i>Radnetz Brandenburg</i> handelt es sich um ein flächendeckendes Radnetz für
              ganz Brandenburg, das weder nur entlang der Hauptstraßen verläuft, noch sich
              ausschließlich auf Nebenstraßen fokussiert, sondern ausgewogen und übergreifend den
              stets besten Weg versucht zu finden. Das Netz wird also neben Bundes- und
              Landesstraßen auch aus Kreis- und Gemeindestraßen und Wald- und Wirtschaftswegen
              bestehen.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Wie sieht das Umsetzungskonzept aus?
              </summary>
              Der erarbeitete und final abgestimmte Netzentwurf soll zukünftig die Grundlage für die
              Bedarfsplanung des Radwegebaus bilden. Erst wenn das Zielnetz vorliegt, kann mit der
              Ausarbeitung des Umsetzungskonzepts begonnen werden. Priorität wird dabei das
              Schließen von Netzlücken haben. Gemäß Radverkehrsstrategie 2030 des Landes Brandenburg
              wird angestrebt, das Netz bis 2045 umzusetzen.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Wie wurden die Zielpunkte für das Luftliniennetz ausgewählt?
              </summary>
              Die Auswahl der Zielpunkte erfolgte nach dem System der Zentralen Orte, sodass neben
              der Metropolregion Berlin-Brandenburg und den vier kreisfreien Städten alle
              Mittelzentren und Mittelzentren in Funktionsteilung berücksichtigt wurden. Darüber
              hinaus wurden alle Grundfunktionalen Schwerpunkte und Bahn-Haltepunkte außerhalb der
              genannten Orte eingebunden. Nach Rücksprache mit den Landkreisen wurden abschließend
              weitere Quellen und Ziele von überregionaler Bedeutung, wie z.B. große Arbeits- und
              weitere Siedlungsschwerpunkte, mit aufgenommen. Durch die Verbindung der Zielpunkte
              ist schließlich das Luftliniennetz entstanden.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Nach welchen Kriterien erfolgt die Netzumlegung?
              </summary>
              Bei der sogenannten Netzumlegung wurden alle Luftlinien auf tatsächlich bestehende
              Straßen- und wegeverbindungen umgelegt. Dies erfolgte nach der Methodik der
              Bestwegeumlegung, d.h. es wurde stets der kürzeste Weg zwischen den festgelegten
              Zielpunkten gesucht. Dabei wurden – bis auf Autobahnen – alle Straßen- und
              Wegeverbindungen berücksichtigt. Anschließend wurde das Netz hinsichtlich
              Plausibilität geprüft und manuell verfeinert.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Wie wird die Beteiligung ausgewertet?
              </summary>
              Alle eingegangenen Hinweise und Rückmeldungen werden fachlich geprüft und abgewogen.
              Nach der Auswertung werden die Hinweise und Rückmeldungen für alle Beteiligten im
              Radverkehrsatlas veröffentlicht und der Netzentwurf ggf. angepasst.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Werden Radschnellverbindungen (RSV) berücksichtigt?
              </summary>
              Die Potenzialanalyse zu Radschnellverbindungen wurde bei der Netzentwicklung
              berücksichtigt. Ein Großteil der 16 identifizierten Potenziale befindet sich in der
              Metropolregion, weshalb den Anschlusspunkten an das Berliner Radnetz eine besondere
              Bedeutung zukommt. Auch die Verbindungen zwischen Lauchhammer und Schwarzheide sowie
              zwischen Senftenberg und Großräschen wurden berücksichtigt.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Wird das Radnetz verschiedene Hierarchieebenen berücksichtigen?
              </summary>
              Das Konzept zum Radnetz Brandenburg wird zunächst ohne hierarchische Unterscheidung
              aufgestellt. Auf diese Weise werden keine Städte oder Verbindungen bevorzugt, sondern
              alle Strecken gleichbehandelt.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Welche Qualitäts- und Ausbaustandards soll das Radnetz aufweisen?
              </summary>
              Die Qualitäts- und Ausbaustandards befinden sich zum aktuellen Zeitpunkt noch in
              Abstimmung.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Wie wird das Radnetz finanziert?
              </summary>
              Die Finanzierung ist zum jetzigen Zeitpunkt nicht abschließend geklärt.
            </details>
          </li>
          <li>
            <details>
              <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
                Werden auch länderübergreifende Radwegeplanungen berücksichtigt?
              </summary>
              Bei der Aufstellung des Luftliniennetzes wurden in Abstimmung mit den angrenzenden
              Bundesländern und Wojewodschaften auch dortige Zielpunkte, Radnetze und -konzepte
              eingebunden. Die Anschlüsse an bestehende und / oder geplante benachbarte Radnetze
              werden im Rahmen der Planung somit also sichergestellt und länderübergreifende Routen
              berücksichtigt.
            </details>
          </li>
        </ul>
      </details>
    </>
  )
}

export const SurveyBB: React.FC<Props> = ({ surveyId }) => {
  const router = useRouter()
  const [isUrlInvalid, setIsUrlInvalid] = useState(false)
  const { id } = router.query
  const institution = institutions_bboxes.find((i) => i.id === id)?.institution || "unbekannt"
  const landkreis = institutions_bboxes.find((i) => i.id === id)?.landkreis || "unbekannt"

  // in survey radnetz-brandenburg, the institution id is passed as a query parameter in the original url sent to the user
  // the institution name should appear in the survey response
  // we need to update the query parameter here to include the institution name (we get it from the institutions_bboxes by the institution id)
  // the ReadOnlyResponseComponent in Question.tsx gets the institution name from the url, displays it and saves it in the survey response

  // todo survey ? effect and dependency router?
  useEffect(() => {
    if (institution === "unbekannt" || landkreis === "unbekannt") setIsUrlInvalid(true)
    router.query.institution = encodeURIComponent(institution)
    router.query.landkreis = encodeURIComponent(landkreis)
    void router.replace({ query: router.query }, undefined, {
      scroll: false,
    })
  }, [institution, landkreis, router.query.id])

  return (
    <SurveyMainPage
      isStartDisabled={isUrlInvalid}
      startContent={<StartContent />}
      surveyId={surveyId}
      emailDefinition={emailDefinition}
      feedbackDefinition={feedbackDefinition}
      moreDefinition={moreDefinition}
      stageProgressDefinition={stageProgressDefinition}
      surveyDefinition={surveyDefinition}
      responseConfig={responseConfig}
      institutionsBboxes={institutions_bboxes}
    />
  )
}
