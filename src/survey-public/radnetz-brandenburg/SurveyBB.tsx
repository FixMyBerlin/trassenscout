import clsx from "clsx"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect } from "react"
import institutions_bboxes from "src/survey-public/radnetz-brandenburg/data/institutions_bboxes.json"
import { SurveyMainPage } from "../components/SurveyMainPage"
import { SurveyH1, SurveyH3, SurveyP } from "../components/core/Text"
import { partcipationLinkStyles } from "../components/core/links/styles"
import AtlasImage from "./data/Startseite_Platzhalter_Radverkehrstlas.png"
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
  return (
    <>
      <SurveyH1>Beteiligung der Kommunen und Landkreise zum Radnetz Brandenburg</SurveyH1>
      <SurveyP>
        Mit dem “Radnetz Brandenburg” gegenwärtig ein landesweites Konzept für ein überregionales
        und durchgängiges Radnetz für den touristischen und Alltagsradverkehr entwickelt, das in den
        kommenden Jahren als <strong>neue Grundlage</strong> für die Bedarfsplanung und zukünftige
        flächendeckende Erschließung des Landes Brandenburg dienen soll.
      </SurveyP>
      <SurveyP>
        Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom Ministerium
        für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll Deutschland GmbH und
        FixMyCity GmbH. Um die Belange aller Baulastträger zu berücksichtigen, besteht zudem eine
        enge Zusammenarbeit mit den Landkreisen, kreisfreien Städten und Kommunen.
      </SurveyP>
      <SurveyP>
        Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom Ministerium
        für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll Deutschland GmbH und
        FixMyCity GmbH. Um die Belange aller Baulastträger zu berücksichtigen, besteht zudem eine
        enge Zusammenarbeit mit den Landkreisen, kreisfreien Städten und Kommunen.
      </SurveyP>
      <SurveyH3>
        Bitte geben Sie uns Ihre Rückmeldungen und Ihr lokales Wissen zum Zielnetzentwurf!
      </SurveyH3>
      <SurveyP>
        Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom Ministerium
        für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll Deutschland GmbH und
        FixMyCity GmbH. Um die Belange aller Baulastträger zu berücksichtigen, besteht zudem eine
        enge Zusammenarbeit mit den Landkreisen, kreisfreien Städten und Kommunen.
      </SurveyP>
      <a
        href="https://radverkehrsatlas.de/regionen/bb-beteiligung?v=1&map=11/52.397/13.034&config=!(i~bikelanes-minimal~a~~sc~!(i~bikelanes~s~!(i~hidden~a~_F)(i~default~a)(i~details~a~_F)(i~width~a~_F)))(i~poi~a~_F~sc~!(i~poi~s~!(i~hidden~a~_F)(i~default~a)(i~education~a~_F))(i~poiPlaces~s~!(i~hidden~a~_F)(i~default~a)(i~circle~a~_F))(i~poiBoundaries~s~!(i~hidden~a)(i~default~a~_F)(i~category*_district*_label~a~_F)(i~category*_municipality~a~_F)(i~category*_municipality*_label~a~_F))(i~poiPlusBarriers~s~!(i~default~a~_F))(i~poiPlusLanduse~s~!(i~default~a~_F))(i~poiPlusPublicTransport~s~!(i~default~a~_F)))(i~roads~a~_F~sc~!(i~roads~s~!(i~hidden~a~_F)(i~default~a)(i~sidestreets~a~_F)(i~mainstreets~a~_F))(i~maxspeed~s~!(i~hidden~a)(i~default~a~_F)(i~below30~a~_F)(i~above40~a~_F))(i~roads*_plus*_footways~s~!(i~default~a~_F)))(i~mapillary~a~_F~sc~!(i~mapillaryCoverage~s~!(i~hidden~a~_F)(i~default~a)(i~all~a~_F)(i~age~a~_F)(i~pano~a~_F)))~"
        target="_blank"
        className="mt-8"
      >
        <div className="md:h-[480px] overflow-hidden flex justify-center items-center my-8">
          <Image
            src={AtlasImage}
            alt="Radverkehrsatlas Land Brandenburg"
            className="object-cover w-full"
          />
        </div>
      </a>
      <SurveyP>
        Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom Ministerium
        für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll Deutschland GmbH und
        FixMyCity GmbH. Um die Belange aller Baulastträger zu berücksichtigen, besteht zudem eine
        enge Zusammenarbeit mit den Landkreisen, kreisfreien Städten und Kommunen.
      </SurveyP>
      <SurveyH3>Häufige Fragen </SurveyH3>
      <ul className={clsx("mb-8 space-y-1")}>
        <li>
          <details>
            <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
              Was bedeutet baulasträgerübergreifendes Radnetz?
            </summary>
            Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom
            Ministerium für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll
            Deutschland GmbH und FixMyCity GmbH.{" "}
          </details>
        </li>
        <li>
          <details>
            <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
              Was bedeutet baulasträgerübergreifendes Radnetz?
            </summary>
            Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom
            Ministerium für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll
            Deutschland GmbH und FixMyCity GmbH.{" "}
          </details>
        </li>
        <li>
          <details>
            <summary className={clsx(partcipationLinkStyles, "cursor-pointer")}>
              Was bedeutet baulasträgerübergreifendes Radnetz?
            </summary>
            Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom
            Ministerium für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll
            Deutschland GmbH und FixMyCity GmbH.{" "}
          </details>
        </li>
      </ul>
      <SurveyP>
        Die Erarbeitung des baulastträgerübergreifenden Konzepts erfolgt durch die vom Ministerium
        für Landesplanung und Infrastruktur beauftragten Dienstleister Rambøll Deutschland GmbH und
        FixMyCity GmbH. Um die Belange aller Baulastträger zu berücksichtigen, besteht zudem eine
        enge Zusammenarbeit mit den Landkreisen, kreisfreien Städten und Kommunen.
      </SurveyP>
    </>
  )
}

export const SurveyBB: React.FC<Props> = ({ surveyId }) => {
  const router = useRouter()
  const { id } = router.query
  const name = institutions_bboxes.find((i) => i.id === id)?.name || "invalid"

  // in survey radnetz-brandenburg, the institution id is passed as a query parameter in the original url sent to the user
  // the institution name should appear in the survey response
  // we need to update the query parameter here to include the institution name (we get it from the institutions_bboxes by the institution id)
  // the ReadOnlyResponseComponent in Question.tsx gets the institution name from the url, displays it and saves it in the survey response

  // todo survey ? effect and dependency router?
  useEffect(() => {
    router.query.institution = encodeURIComponent(name)
    void router.push({ query: router.query }, undefined, {
      scroll: false,
    })
  }, [name, router.query.id])

  return (
    <SurveyMainPage
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
