import { MapProvider } from "react-map-gl"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
} from "src/core/components/forms"
import { H2 } from "src/core/components/text"
import { TMapProps, TResponse, TResponseConfig } from "src/survey-public/components/types"

import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { getSurveyDefinitionBySurveySlug } from "src/survey-public/utils/getConfigBySurveySlug"
import getSurvey from "src/surveys/queries/getSurvey"
import { z } from "zod"
import { ExternalSurveyResponseFormMap } from "./ExternalSurveyResponseFormMap"

export { FORM_ERROR } from "src/core/components/forms"

export function ExternalSurveyResponseForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    mapProps: TMapProps
    categories: TResponse[]
    evaluationRefs: TResponseConfig["evaluationRefs"]
  },
) {
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { id: Number(surveyId) })
  const { mapProps, categories, evaluationRefs } = props
  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)

  return (
    <Form<S> {...props}>
      <H2>Neuen Beitrag erfassen</H2>
      <p>
        Hier können Sie die Beiträge erfassen, die abseits der Online-Beteiligung eingereicht
        wurden.
      </p>

      <LabeledRadiobuttonGroup
        label="Bezieht sich das Feedback auf eine konkrete Stelle entlang der Route?"
        scope={`single-${evaluationRefs["is-feedback-location"]}`}
        items={[
          { value: "true", label: "Ja" },
          { value: "false", label: "Nein" },
        ]}
      />

      <MapProvider>
        <ExternalSurveyResponseFormMap
          isUserLocationQuestionId={evaluationRefs["is-feedback-location"]!}
          userLocationQuestionId={evaluationRefs["feedback-location"]!}
          mapProps={mapProps}
          maptilerUrl={surveyDefinition.maptilerUrl}
        />
      </MapProvider>

      <LabeledTextareaField
        className="h-28"
        label="Hinweis"
        placeholder="Hinweis hier einfügen..."
        name={`text-${evaluationRefs["feedback-usertext-1"]}`}
      />

      <LabeledSelect
        name="source"
        label="Eingereicht"
        options={[
          ["EMAIL", "per E-Mail"],
          ["LETTER", "per Brief"],
        ]}
      />

      <LabeledRadiobuttonGroup
        label="Kategorie"
        scope={`single-${evaluationRefs["feedback-category"]}`}
        classNameItemWrapper="sm:columns-2"
        items={categories.map((category) => {
          return { value: String(category.id), label: category.text.de }
        })}
      />
    </Form>
  )
}
