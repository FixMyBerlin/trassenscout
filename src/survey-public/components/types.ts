export type TSurvey = {
  part: number
  version: number
  logoUrl: string
  canonicalUrl: string
  pages: TPage[]
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

type TColor = "white" | "pink" | "blue"

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
  button: TButton
}

export type TMore = {
  title: TTranslatableText
  description: TTranslatableText
  questionText: TTranslatableText
  buttons: TButtonWithAction[]
}

type TMapProps = {
  maptilerStyleUrl: string
  marker?: {
    lat: number
    lng: number
  }
  layerStyles?: Record<string, any>[]
  projectGeometry?: {
    type: "FeatureCollection"
    features: {
      id?: string
      type: "Feature"
      properties: {}
      geometry: {
        coordinates: any[]
        type: "MultiLineString" | "LineString"
      }
    }[]
  }
  config?: Record<string, any>
  placeholder?: TTranslatableText
  caption?: TTranslatableText
}

type TTextProps = {
  placeholder?: TTranslatableText
  caption?: TTranslatableText
}

export type TFeedbackQuestion = {
  evaluationRef?: string
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
  evaluationRefs: Record<string, number | number[]>
}

export type TProgress = Record<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "DONE", number>
