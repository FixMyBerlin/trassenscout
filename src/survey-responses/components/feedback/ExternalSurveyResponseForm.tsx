import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getQuestionIdBySurveySlug"
import {
  Form,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
} from "@/src/core/components/forms"
import { H2 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { SurveyResponseSourceEnum } from "@prisma/client"
import { MapProvider } from "react-map-gl/maplibre"
import { z } from "zod"
import { ExternalSurveyResponseFormMap } from "./ExternalSurveyResponseFormMap"

type Props = {
  mapProps: any
  categories: any
  handleSubmit: any
}

export const ExternalSurveyResponseForm = ({ mapProps, categories, handleSubmit }: Props) => {
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })

  // legacy surveys
  // we do not refactor it for nw as we want to remove it in the future
  const metaDefinition = getConfigBySurveySlug(survey.slug, "meta")

  const categoryId = getQuestionIdBySurveySlug(survey.slug, "category")
  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")
  const isLocationId = getQuestionIdBySurveySlug(survey.slug, "is-location")
  const userText1Id = getQuestionIdBySurveySlug(survey.slug, "feedbackText")

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
        [`single-${isLocationId}`]: "true",
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
        scope={`single-${isLocationId}`}
        items={[
          { value: "true", label: "Ja" },
          { value: "false", label: "Nein" },
        ]}
      />

      <MapProvider>
        <ExternalSurveyResponseFormMap
          isUserLocationQuestionId={isLocationId!}
          userLocationQuestionId={locationId!}
          mapProps={mapProps}
          maptilerUrl={metaDefinition.maptilerUrl}
        />
      </MapProvider>

      <LabeledTextareaField
        className="h-28"
        label="Hinweis"
        placeholder="Hinweis hier einfügen..."
        name={`text-${userText1Id}`}
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
        scope={`single-${categoryId}`}
        classNameItemWrapper="sm:columns-2"
        // @ts-expect-error
        items={categories.map((category) => {
          return { value: String(category.key), label: category.label }
        })}
      />
    </Form>
  )
}
