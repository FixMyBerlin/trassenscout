import { MapProvider } from "react-map-gl"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
} from "src/core/components/forms"
import { H2 } from "src/core/components/text"
import { TMapProps, TResponse } from "src/survey-public/components/types"

import { z } from "zod"
import { ExternalSurveyResponseFormMap } from "./ExternalSurveyResponseFormMap"

export { FORM_ERROR } from "src/core/components/forms"

export function ExternalSurveyResponseForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    mapProps: TMapProps
    categories: TResponse[]
    isLocation: boolean
    setIsLocation: any
  },
) {
  const { mapProps, categories, isLocation, setIsLocation } = props

  return (
    <Form<S> {...props}>
      <H2>Neuen Beitrag erfassen</H2>
      <p>
        Hier können Sie die Beiträge erfassen, die abseits der Online-Beteiligung eingereicht
        wurden.
      </p>

      <LabeledRadiobuttonGroup
        label="Bezieht sich das Feedback auf eine konkrete Stelle entlang der Route?"
        scope="isLocation"
        items={[
          { value: "true", label: "Ja" },
          { value: "false", label: "Nein" },
        ]}
      />

      <MapProvider>
        <ExternalSurveyResponseFormMap
          isLocation={isLocation}
          setIsLocation={setIsLocation}
          mapProps={mapProps}
        />
      </MapProvider>

      <LabeledTextareaField
        className="h-28"
        label="Hinweistext"
        placeholder="Hinweis hier einfügen..."
        name="userText1"
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
        scope="categoryId"
        classNameItemWrapper="sm:columns-2"
        items={categories.map((category) => {
          return { value: String(category.id), label: category.text.de }
        })}
      />
    </Form>
  )
}
