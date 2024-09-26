import { isProduction } from "@/src/core/utils"
import institutions_bboxes from "@/src/survey-public/radnetz-brandenburg/data/institutions_bboxes.json"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { clsx } from "clsx"
import Image from "next/image"
import { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { SurveyMainPage } from "../components/SurveyMainPage"
import { SurveyH1, SurveyH2, SurveyH3, SurveyP } from "../components/core/Text"
import { SurveyLink } from "../components/core/links/SurveyLink"
import {
  partcipationLinkStyles,
  primaryColorButtonStylesForLinkElement,
  surveyPrimaryColorButtonStyles,
} from "../components/core/links/styles"
import AtlasImage from "./data/Startseite_Radverkehrstlas.jpg"
import { emailDefinition } from "./data/email"
import { feedbackDefinition } from "./data/feedback"
import { moreDefinition } from "./data/more"
import { stageProgressDefinition } from "./data/progress"
import { responseConfig } from "./data/response-config"
import { surveyDefinition } from "./data/survey"

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
      <SurveyH1>Beteiligung der Kommunen an der Konzeption des „Radnetz Brandenburg“ </SurveyH1>
      <SurveyP>
        Mit dem Radnetz Brandenburg wird ein Konzept für ein umfassendes und komfortabel befahrbares
        Wegenetz für den Alltagsverkehr – unter Einbezug der touristischen Radrouten – erstellt. Das
        baulastträgerübergreifende Radnetz-Konzept soll dazu dienen, für die kommenden Jahre eine
        neue Grundlage für die Bedarfsplanung zu haben, Prozesse zur Priorisierung und Umsetzung
        unter den Baulastträgern zu optimieren sowie sukzessive vorhandene Infrastrukturen zu
        ertüchtigen und vor allem Netzlücken zu schließen. Mit dem Konzept sollen im Ergebnis
        durchgängige Radverkehrsverbindungen und somit die Grundlage für eine zukünftige
        flächendeckende Erschließung des Landes Brandenburg mit Infrastruktur für den Radverkehr
        geschaffen werden.
      </SurveyP>
      <SurveyP>
        Hierfür wurden zuerst <strong>Quellen und Ziele</strong> des Alltagsradverkehrs
        identifiziert und in einem <strong>Luftliniennetz</strong> miteinander verknüpft. Diese
        orientieren sich zum Beispiel an den Ober- und Mittelzentren, den Grundfunktionalen
        Schwerpunkten, Bahnhöfen und weiteren regionalen Schwerpunkten, wie beispielsweise wichtige
        touristische Destinationen. In einem nächsten Schritt wird ein <strong>Zielnetz</strong>{" "}
        entwickelt, in dem das Luftliniennetz auf das bestehende Wegenetz umgelegt wird und so auch
        wichtige Lückenschlüsse identifiziert werden. Dabei werden auch weitere wichtige Standorte
        wie zum Beispiel Schulen berücksichtigt. Die Konzeption betrachtet grundsätzlich alle
        bestehenden Infrastrukturen und Wegeverbindungen, unter anderem straßenbegleitende und
        selbständige Radwege, Wirtschaftswege, touristische Radrouten und innerörtliche Straßen. So
        weit wie möglich wird auf die vorhandene Infrastruktur zurückgegriffen.
      </SurveyP>
      <SurveyP>
        Weiterführende Informationen zum Radnetz Brandenburg finden Sie auf der{" "}
        <a
          className={partcipationLinkStyles}
          target="_blank"
          href="https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/radnetz-brandenburg/"
        >
          Website des Ministeriums für Infrastruktur und Landesplanung
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
        <strong>vom 30. September bis zum 08. November 2024</strong> die Möglichkeit, den Entwurf
        des Radnetzkonzeptes zu kommentieren.{" "}
      </SurveyP>
      <SurveyH3>So geht’s!</SurveyH3>
      <ul className="ml-6 list-disc space-y-2 text-base sm:text-lg">
        <li>
          Schauen Sie sich vorab den Zielnetzentwurf im Radverkehrsatlas an. Starten Sie erst dann
          die Beteiligung.{" "}
        </li>
        <li>
          Nach Start der Beteiligung müssen Sie sich bitte zuerst mit Namen, E-Mail-Adresse und PIN
          registrieren. Die Felder “Institution” und “Landkreis” werden dabei automatisch
          ausgefüllt.
        </li>
        <li>
          Bevor Sie Ihre Hinweise zum Netzentwurf abgeben können, möchten wir Sie außerdem bitten,
          zum Einstieg eine kurze Umfrage mit zwei allgemeinen Fragen zu beantworten.
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
        <li>
          Bei Rückfragen zur Beteiligung oder technischen Schwierigkeiten können Sie sich gerne an
          die beim durchführenden Unternehmen FixMyCity zuständige Mitarbeiterin, Frau Noemi Kuß,
          wenden: <br />
          <br />
          Mail: <SurveyLink href={`mailto:§{noemi@fixmycity.de}`}>
            noemi@fixmycity.de
          </SurveyLink>{" "}
          <br />
          Tel.: 030-62939269
        </li>
      </ul>
      <SurveyH2>Zielnetzentwurf im Radverkehrsatlas ansehen</SurveyH2>
      <SurveyP>
        Unter dem unten stehenden Link können Sie sich den Zielnetzentwurf im Radverkehrsatlas
        anschauen. Bitte beachten Sie, dass es sich hierbei um einen Entwurf handelt. Die
        vorgeschlagenen Verbindungen können sich, je nach Rückmeldungen seitens der Beteiligten,
        noch ändern.
      </SurveyP>
      <SurveyP>
        Im Radverkehrsatlas sind auch die gesammelten Daten zur Bestandsinfrastruktur und zu
        Radrouten, verschiedene Daten aus OpenStreetMap sowie das Luftliniennetz einsehbar. Eine
        Anleitung zur Nutzung des Radverkehrsatlasses finden Sie{" "}
        <SurveyLink
          blank
          href={
            isProduction
              ? "https://trassenscout.de/radnetz-brandenburg/anleitung-radverkehrsatlas-beteiligung-bb.pdf"
              : "https://staging.trassenscout.de/radnetz-brandenburg/anleitung-radverkehrsatlas-beteiligung-bb.pdf"
          }
        >
          hier
        </SurveyLink>
        .
      </SurveyP>
      <SurveyP>
        Der Radverkehrsatlas öffnet sich in einem neuen Tab. Kehren Sie anschließend hier zur
        Beteiligung zurück.
      </SurveyP>
      <button
        type="button"
        onClick={openModal}
        className="relative my-8 flex h-[480px] w-full items-center justify-center overflow-hidden"
      >
        <Image
          src={AtlasImage}
          alt="Radverkehrsatlas Land Brandenburg"
          className="h-full object-cover"
        />
        <div className="absolute bottom-[45%] mx-8 max-w-[365px] bg-white/80 p-4 px-8 text-center font-sans font-semibold">
          Schauen Sie sich den gesamten{" "}
          <span className={partcipationLinkStyles}>Zielnetzentwurf im Radverkehrsatlas</span> an.
        </div>
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 flex items-center justify-center"
          onClose={closeModal}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle as="h3" className="text-lg font-bold leading-6 text-gray-700">
                    Achtung:
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      Durch Aufrufen der Seite bestätige ich, dass der Link zum Radverkehrsatlas und
                      die enthaltenen Daten<b> vertraulich</b> behandelt und nicht an unbefugte
                      Dritte weitergegeben werden.{" "}
                    </p>
                  </div>

                  <div className="mt-4">
                    <a
                      href="https://radverkehrsatlas.de/regionen/bb-beteiligung?map=7.6/52.492/13.016&config=z9tzbb.1734h0.i&data=bb-land-klassifiertes-strassennetz,bb-ramboll-netzentwurf-2,bb-ramboll-quellen-ziele&v=2"
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
                </DialogPanel>
              </TransitionChild>
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
            "mb-4 mt-8 cursor-pointer text-lg font-extrabold !text-black hover:!text-[#C73C35] hover:!decoration-[#C73C35]",
          )}
        >
          Häufige Fragen
        </summary>
        <ul className={clsx("mb-8 space-y-4")}>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Was bedeutet baulastträgerübergreifendes Radnetz?
              </summary>
              Mit dem „Radnetz Brandenburg“-Konzept sollen durchgängige Radverkehrsverbindungen für
              das gesamte Land Brandenburg geschaffen werden. In dieses Konzept werden sowohl
              Abschnitte an Bundes- und Landesstraßen als auch an Kreis- und Gemeindestraßen
              einbezogen. Darüber hinaus werden auch touristische Radrouten und alternative
              Wegeführungen wie Wald- und Wirtschaftswege berücksichtigt. Somit wird das „Radnetz
              Brandenburg“-Konzept eine Bedarfsgrundlage für alle Baulastträger (Landesbetrieb
              Straßenwesen, Landkreise, Gemeinden etc.) im Land Brandenburg bilden.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Wie sieht die Umsetzung des „Radnetz Brandenburg“-Konzepts aus?
              </summary>
              Der erarbeitete und final abgestimmte Zielnetzentwurf soll zukünftig die Grundlage für
              die Bedarfsplanung des Radwegebaus bilden. Erst wenn das Zielnetz vorliegt, kann mit
              der Abstimmung zur Umsetzung des Konzepts zwischen den beteiligten Baulastträgern
              begonnen werden. Priorität wird dabei das Schließen von Netzlücken haben sowie die
              Ertüchtigung bestehender Infrastruktur (z.B. Wirtschaftswege), so dass diese ebenfalls
              sicher und komfortabel durch den Radverkehr genutzt werden können.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Wie wurden die Zielpunkte für das Luftliniennetz ausgewählt?
              </summary>
              Die Auswahl der Zielpunkte erfolgte nach dem System der Zentralen Orte, sodass neben
              der Metropole Berlin und den vier kreisfreien Städten alle Mittelzentren und
              Mittelzentren in Funktionsteilung berücksichtigt wurden. Darüber hinaus wurden alle
              Grundfunktionalen Schwerpunkte und Bahn-Haltepunkte außerhalb der Zentralen Orte
              eingebunden, um so auch den Umweltverbund zu stärken. Nach Rücksprache mit den
              Landkreisen wurden abschließend weitere Quellen und Ziele von überregionaler
              Bedeutung, wie z.B. große Arbeitgeber, mit aufgenommen. Durch die Verbindung der
              Zielpunkte ist schließlich das Luftliniennetz entstanden.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Nach welchen Kriterien erfolgt die Netzumlegung?
              </summary>
              Bei der sogenannten Netzumlegung wurden alle Luftlinien auf tatsächlich bestehende
              Straßen- und Wegeverbindungen umgelegt. Dies erfolgte nach der Methodik der
              Bestwegeumlegung, d.h. es wurde stets der kürzeste Weg zwischen den festgelegten
              Zielpunkten gesucht. Dabei wurden – bis auf Autobahnen – alle Straßen- und
              Wegeverbindungen berücksichtigt. Anschließend wurde das Netz hinsichtlich
              Plausibilität geprüft und im Einzelfall manuell angepasst.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Wie werden die Hinweise der Kommunen ausgewertet?
              </summary>
              Alle eingegangenen Hinweise werden fachlich geprüft und abgewogen. Je nach Abwägung
              wird der Netzentwurf daraufhin noch einmal angepasst. Nach der Auswertung werden die
              Hinweise (einschließlich Abwägung) für alle Beteiligten im Radverkehrsatlas
              veröffentlicht.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Werden Radschnellverbindungen (RSV) und Radvorrangrouten (RVR) berücksichtigt?
              </summary>
              Die im Rahmen der Potenzialanalyse zu Radschnellverbindungen ermittelten RSV und RVR
              wurden bei der Netzentwicklung berücksichtigt. Ein Großteil der identifizierten
              Potenziale befindet sich im Berliner Umland, weshalb den Anschlusspunkten an das
              Berliner Radnetz eine besondere Bedeutung zukommt. Ebenfalls wurde die RVR Königs
              Wusterhausen – Flughafen BER – Berlin mitberücksichtigt.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Wird das „Radnetz Brandenburg“-Konzept verschiedene Hierarchieebenen
                berücksichtigen?
              </summary>
              Das Konzept zum Radnetz Brandenburg wird grundsätzlich ohne hierarchische
              Unterscheidung aufgestellt. Auf diese Weise werden keine Städte oder Verbindungen
              bevorzugt, sondern alle Strecken gleichbehandelt.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Welche Qualitäts- und Ausbaustandards soll das Radnetz aufweisen?
              </summary>
              Die Qualitäts- und Ausbaustandards befinden sich zum aktuellen Zeitpunkt noch in
              Abstimmung.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Wie werden die Radverkehrsverbindungen des Radnetz-Konzepts finanziert?{" "}
              </summary>
              Die Finanzierung erfolgt über die Haushalte der jeweiligen Baulastträger und
              entsprechende Fördermittel.
            </details>
          </li>
          <li>
            <details>
              <summary
                className={clsx(
                  partcipationLinkStyles,
                  "hover:!decoration-[#C73C35 cursor-pointer !text-black hover:!text-[#C73C35]",
                )}
              >
                Werden auch Radwegeplanungen benachbarter Länder berücksichtigt?{" "}
              </summary>
              Bei der Aufstellung des Luftliniennetzes wurden in Abstimmung mit den angrenzenden
              Bundesländern und Wojewodschaften auch dortige Zielpunkte, bestehende Radwege und
              Radnetzkonzepte eingebunden. Die Anschlüsse an bestehende und / oder geplante
              Radverbindungen werden im Rahmen der Planung somit sichergestellt und
              länderübergreifende Verbindungen berücksichtigt.
            </details>
          </li>
        </ul>
      </details>
    </>
  )
}

export const SurveyBB = ({ surveyId }: Props) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
