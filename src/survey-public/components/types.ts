import { LngLatBoundsLike } from "react-map-gl/maplibre"

export type TSurvey = {
  part: number
  version: number
  logoUrl: string
  canonicalUrl: string
  primaryColor: string
  lightColor: string
  darkColor: string
  pages: TPage[]
  deletedQuestions?: TQuestion[]
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
  component: "singleResponse" | "multipleResponse"
  label: TTranslatableText
  help?: TTranslatableText
  props: TSingleOrMultiResponseProps
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
}

export type TResponse = {
  id: number
  text: TTranslatableText
  help?: TTranslatableText
}

export type TEmail = {
  title: TTranslatableText
  questionText: TTranslatableText
  description: TTranslatableText
  mailjetWidgetUrl: string
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
  maptilerStyleUrl: string
  marker?: {
    lat: number
    lng: number
  }
  config: {
    bounds: LngLatBoundsLike
  }
  legend?: Record<string, TLegendItem>
  placeholder?: TTranslatableText
  caption?: TTranslatableText
}
export type TLegendItem = {
  label: TTranslatableText
  color: string
  height: string
  shape: "line" | "dot"
}

type TTextProps = {
  placeholder?: TTranslatableText
  caption?: TTranslatableText
}

export type TFeedbackQuestion = {
  id: number
  label: TTranslatableText
  component: "singleResponse" | "multipleResponse" | "text" | "map" | "custom"
  props?: TSingleOrMultiResponseProps | TMapProps | TTextProps
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
  evaluationRefs: Record<string, number>
}

export type TProgress = Record<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL", number>
