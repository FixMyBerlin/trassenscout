import { LineString, MultiLineString } from "geojson"

export type TSurvey = {
  part: number
  version: number
  logoUrl: string
  canonicalUrl: string
  maptilerUrl: string
  atlasUrl?: string
  primaryColor: string
  lightColor: string
  darkColor: string
  pages: TPage[]
  deletedQuestions?: TQuestion[]
  // atm we only have "line" geometryCategoryType, coordinates are of type LineString or MultiLineString (the distinction between those two can be made by checking the shape of the first element in the coordinates array)
  // we define the geometryCategoryType explicilitly here as we might have "polygon" geometryCategoryTypes in the future we might have "polygon" geometryCategoryTypes
  // we can not store this information in the geometry atm
  // will be reworked with https://github.com/FixMyBerlin/private-issues/issues/2196
  geometryCategoryType: "line" | "polygon"
  // geometryFallback is used for surveys rs8 adn frm7 that have a geometry-category question
  // starting with radnetz BB all surveys have geometry-category questions
  geometryFallback?: LineString["coordinates"] | MultiLineString["coordinates"]
}

export type TPage = {
  id: number
  title: TTranslatableText
  description: TTranslatableText
  questions?: TQuestion[]
  buttons: TButtonWithAction[]
}

export type TQuestion = {
  id: number
  component: "singleResponse" | "multipleResponse" | "textfield" | "readOnly" | "text"
  label: TTranslatableText
  help?: TTranslatableText
  props: TSingleOrMultiResponseProps | TReadOnlyProps | TTextfieldProps | TTextareaProps
}

export type TButtonWithAction = {
  label: TTranslatableText
  color: TColor
  onClick: {
    action: "nextPage" | "previousPage" | "submit"
  }
}

type TButton = {
  label: TTranslatableText
  color: TColor
}

type TColor = "white" | "primaryColor"

type TTranslatableText = {
  de: string
}

export type TSingleOrMultiResponseProps = {
  responses: TResponse[]
  validation?: {
    // atm all multiResponse questions are optional, this has to be changed in the future:
    // https://github.com/FixMyBerlin/private-issues/issues/1710
    // all singleResponse questions are required by default, this can be changed by setting optional to true
    optional?: boolean
    // todo validation for multiResponse: min/max number of responses
    // maxResponses?: number
    // minResponses?: number
    // customMessage?: string
  }
}

export type TResponse = {
  id: number
  text: TTranslatableText
  help?: TTranslatableText
}

export type TEmail = {
  title: TTranslatableText
  description: TTranslatableText
  mailjetWidgetUrl?: string
  homeUrl: string
  button: TButton
}

export type TMore = {
  title: TTranslatableText
  description: TTranslatableText
  questionText: TTranslatableText
  buttons: TButtonWithAction[]
}

export type TMapProps = {
  marker?: {
    lat: number
    lng: number
  }
  config: {
    bounds: [number, number, number, number]
  }
  legend?: Record<string, Record<string, TLegendItem>>
  placeholder?: TTranslatableText
  caption?: TTranslatableText
}
export type TLegendItem = {
  label: TTranslatableText
  color: string
  className?: string
}

export type TTextfieldProps = {
  placeholder?: TTranslatableText
  caption?: TTranslatableText
  validation?: {
    type: "email" | "text" // default is text
    optional?: boolean // default is false - so if not set it is required
    maxLength?: number // default is 1000 for text and 5000 for textarea
    minLength?: number // default is 1 if optional not set to false // if minLength is set then optional id overwritten
    // customMessage?: string
    regex?: RegExp // default is undefined
  }
}
export type TTextareaProps = {
  placeholder?: TTranslatableText
  caption?: TTranslatableText
  validation?: {
    optional?: boolean // default is false - so if not set it is required
    maxLength?: number // default is 1000 for text and 5000 for textarea
    minLength?: number // default is 1 if optional not set to true // if minLength is set then optional id overwritten
    // customMessage?: string
    regex?: RegExp // default is undefined
  }
}

export type TReadOnlyProps = {
  queryId: string
  placeholder?: TTranslatableText
  caption?: TTranslatableText
}

export type TFeedbackQuestion = {
  help?: TTranslatableText
  id: number
  label: TTranslatableText
  component: "singleResponse" | "multipleResponse" | "text" | "map" | "custom"
  props?: TSingleOrMultiResponseProps | TMapProps | TTextfieldProps | TTextareaProps
}

export type TFeedback = {
  part: number
  pages: {
    id: number
    title: TTranslatableText
    description: TTranslatableText
    questions: TFeedbackQuestion[]
    buttons: TButtonWithAction[]
  }[]
}

export type TResponseConfig = {
  evaluationRefs: {
    category: number
    "is-location": number
    location: number
    feedbackText: number
    "usertext-2"?: number // survey RS8
    "geometry-category"?: number // this is typed as optional because it is introduced in survey BB, for RS8 and FRM7 we use a fallback geometry-category
    "line-id"?: number // survey BB
    "line-from-to-name"?: number // survey BB
  }
}

export type TProgress = Record<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL", number>

export type TInstitutionsBboxes = {
  institution: string
  landkreis: string
  id: string
  bbox: number[]
}[]
