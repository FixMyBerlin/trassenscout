import {
  Form,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
} from "@/src/core/components/forms"
import { H2 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TMapProps, TResponse, TResponseConfig } from "@/src/survey-public/components/types"
import { getSurveyDefinitionBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { SurveyResponseSourceEnum } from "@prisma/client"
import { MapProvider } from "react-map-gl/maplibre"
import { z } from "zod"
import { ExternalSurveyResponseFormMap } from "./ExternalSurveyResponseFormMap"

type Props = {
  mapProps: TMapProps
  categories: TResponse[]
  evaluationRefs: TResponseConfig["evaluationRefs"]
  handleSubmit: any
}

export const ExternalSurveyResponseForm: React.FC<Props> = ({
  mapProps,
  categories,
  evaluationRefs,
  handleSubmit,
}) => {
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)

  const categoryId = evaluationRefs["category"]
  const locationId = evaluationRefs["location"]
  const isLocationId = evaluationRefs["is-location"]
  const userText1Id = evaluationRefs["usertext-1"]

  const ExternalSurveyResponseFormSchema = z.object({
    source: z.nativeEnum(SurveyResponseSourceEnum),
    // todo helper function getFormfieldName()
    [`single-${isLocationId}`]: z.string(),
    [`single-${categoryId}`]: z.string(),
    [`text-${userText1Id}`]: z.string().nonempty({ message: "Pflichtfeld." }),
    [`map-${locationId}`]: z.any(),
  })

  return (
    <Form
      submitText="Speichern"
      onSubmit={handleSubmit}
      initialValues={{
        source: "EMAIL",
        [`single-${evaluationRefs["is-location"]}`]: "true",
        [`map-${locationId}`]: null,
      }}
      schema={ExternalSurveyResponseFormSchema}
    >
      <H2>Neuen Beitrag erfassen</H2>
      <p>
        Hier können Sie die Beiträge erfassen, die abseits der Online-Beteiligung eingereicht
        wurden.
      </p>

      <LabeledRadiobuttonGroup
        label="Bezieht sich das Feedback auf eine konkrete Stelle entlang der Route?"
        scope={`single-${evaluationRefs["is-location"]}`}
        items={[
          { value: "true", label: "Ja" },
          { value: "false", label: "Nein" },
        ]}
      />

      <MapProvider>
        <ExternalSurveyResponseFormMap
          isUserLocationQuestionId={evaluationRefs["is-location"]!}
          userLocationQuestionId={evaluationRefs["location"]!}
          mapProps={mapProps}
          maptilerUrl={surveyDefinition.maptilerUrl}
        />
      </MapProvider>

      <LabeledTextareaField
        className="h-28"
        label="Hinweis"
        placeholder="Hinweis hier einfügen..."
        name={`text-${evaluationRefs["usertext-1"]}`}
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
        scope={`single-${evaluationRefs["category"]}`}
        classNameItemWrapper="sm:columns-2"
        items={categories.map((category) => {
          return { value: String(category.id), label: category.text.de }
        })}
      />
    </Form>
  )
}
