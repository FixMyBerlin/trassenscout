export type TSurvey = {
  part: number
  version: number
  logoUrl: string
  canonicalUrl: string
  maptilerUrl: string
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
  //validation?: {
  // optional?: boolean // default is false
  // todo validation for multiResponse: min/max number of responses
  // maxResponses?: number
  // minResponses?: number
  // customMessage?: string
  // }
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
    "feedback-category": number
    "is-feedback-location": number
    "feedback-location": number
    "feedback-usertext-1": number
    "feedback-usertext-2"?: number // survey RS8
    "line-id"?: number // survey BB
    "line-geometry"?: number // survey BB
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
