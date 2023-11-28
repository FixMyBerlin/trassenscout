export type TSurvey = {
  id: number
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
  buttons: TButton[]
}

export type TQuestion = {
  id: number
  component: "singleResponse" | "multipleResponse"
  label: TTranslatableText
  props: TSingleOrMultiResponseProps
}

export type TButton = {
  label: TTranslatableText
  color: "white" | "pink" | "blue"
  onClick?: {
    action: "nextPage" | "previousPage" | "submit"
  }
}

export type TTranslatableText = {
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
  button: TButton[]
}

export type TMore = {
  title: TTranslatableText
  description: TTranslatableText
  questionText: TTranslatableText
  buttons: TButton[]
}
