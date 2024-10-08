import { useParams } from "next/navigation"
import { useRouter } from "next/router"
import { MapProvider } from "react-map-gl/maplibre"
import { Question } from "../Question"
import { SurveyH2, SurveyP } from "../core/Text"
import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"
import { SurveyScreenHeader } from "../core/layout/SurveyScreenHeader"
import { SurveyMapLegend } from "../maps/SurveyMapLegend"
import { SurveyMapLine } from "../maps/SurveyMapLine"
import { TInstitutionsBboxes, TLegendItem, TQuestion } from "../types"

type Props = {
  page: any
  onButtonClick: any // TODO
  onBackClick: any // TODO
  maptilerUrl: string
  feedbackCategoryId: number
  isCompletedProps: { isCompleted: boolean; setIsCompleted: (value: boolean) => void }
  institutionsBboxes?: TInstitutionsBboxes
  // todo survey clean up or refactor after survey BB: legend for line map
  legend?: Record<string, Record<string, TLegendItem>>
}

export const FeedbackFirstPage: React.FC<Props> = ({
  page,
  onButtonClick,
  onBackClick,
  maptilerUrl,
  isCompletedProps: { isCompleted, setIsCompleted },
  feedbackCategoryId,
  institutionsBboxes,
  legend,
}) => {
  // todo survey clean up or refactor after survey BB ? - initial view state of surveymapline depending on institution
  // maybe this logic should be used for SurveyMap in future surveys
  const router = useRouter()
  const { id } = router.query
  const initialBbox = institutionsBboxes?.find((institution) => institution.id === id)?.bbox as [
    number,
    number,
    number,
    number,
  ]
  // @ts-ignore
  const { surveySlug } = useParams()

  const { title, description, buttons, questions } = page

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {/* todo survey clean up or refactor after survey BB */}
      {/* This map to select a line is custom for BB survey and is going to be deleted afterwards */}
      {surveySlug === "radnetz-brandenburg" && (
        <>
          <SurveyH2>{questions[0].label.de} *</SurveyH2>
          <MapProvider>
            <SurveyMapLine
              projectMap={{
                maptilerUrl: maptilerUrl,
                config: {
                  // initialBbox is the bounding box of the institution
                  // fallback is the bounding box of Brandenburg hard coded as it will be deleted anyways
                  bounds: initialBbox || [
                    10.634343374814875, 50.99884540733649, 15.169801938047982, 53.769864338023126,
                  ],
                },
              }}
              setIsCompleted={setIsCompleted} // todo
            />
          </MapProvider>
          {legend && <SurveyMapLegend legend={legend} />}
        </>
      )}
      {/* Category Question */}
      <Question question={questions.find((q: TQuestion) => q.id === feedbackCategoryId)} />
      <SurveyButtonWrapper>
        <SurveyButton
          color={buttons[0].color}
          disabled={!isCompleted}
          type="button"
          onClick={onButtonClick}
        >
          {buttons[0].label.de}
        </SurveyButton>
        {buttons[1] && (
          <SurveyButton color={buttons[1].color} type="button" onClick={onBackClick}>
            {buttons[1].label.de}
          </SurveyButton>
        )}
      </SurveyButtonWrapper>
      <SurveyP className="text-sm sm:text-sm">
        * Pflichtfelder <br />
        Um fortzufahren, bitte alle Pflichtfelder ausfüllen.
      </SurveyP>
    </>
  )
}
