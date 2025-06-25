import { SurveyCheckbox } from "@/src/app/beteiligung/_components/form/Checkbox"
import { SurveyCheckboxGroup } from "@/src/app/beteiligung/_components/form/CheckboxGroup"
import { SurveySimpleMapWithLegend } from "@/src/app/beteiligung/_components/form/map/SimpleMapWithLegend"
import { SurveyPageTitle } from "@/src/app/beteiligung/_components/form/PageTitle"
import { SurveyRadiobuttonGroup } from "@/src/app/beteiligung/_components/form/RadiobuttonGroup"
import { SurveyTextarea } from "@/src/app/beteiligung/_components/form/Textarea"
import { SurveyTextfield } from "@/src/app/beteiligung/_components/form/Textfield"
import { SurveyMarkdown } from "@/src/app/beteiligung/_components/layout/SurveyMarkdown"
import { TBackendConfig } from "@/src/app/beteiligung/_shared/backend-types"
import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import { AnyFieldApi } from "@tanstack/react-form"

import { LineString, MultiLineString } from "geojson"
import { ComponentProps, ReactNode } from "react"

// tbd maybe in the future we want to allow all field options of tanstack form fieldApi
type FormFieldOptions = {
  name: AnyFieldApi["options"]["name"]
  validators?: AnyFieldApi["options"]["validators"]
  listeners?: AnyFieldApi["options"]["listeners"]
}

// base field properties for single form field in config
type FormFieldBase = {
  // tbd
  // multiple dependencies
  // field should only allow existing field keys
  condition?: {
    fieldName: string
    conditionFn: (
      value: boolean | string | number | object | string[] | null | undefined,
      fieldApi?: AnyFieldApi,
    ) => boolean
  }
  // superrefine is an alternative to additional field validators, seems like a good solution as well (had some issues with field validators in combination with from validators at first, taht is why I introduced it), but also limits possibilities (see location where we want to vaidate based on the field meta) tbd
  // see example rs test conditionalCase1A
  // maybe we delete superrefine option in config as for now it does not add functionality tbd
  // zodSuperRefine?: (data: any, ctx: z.RefinementCtx) => void
} & FormFieldOptions

type ContentFieldBase = {
  name: string
}

// type can have a nicer structure, less redundance
export type FieldConfig =
  | ({
      component: "SurveyTextfield"
      componentType: "form"
      validation:
        | (typeof fieldValidationEnum)["optionalString"]
        | (typeof fieldValidationEnum)["requiredString"]
        | (typeof fieldValidationEnum)["conditionalRequiredString"]
      defaultValue: string
    } & FormFieldBase & { props: Omit<ComponentProps<typeof SurveyTextfield>, "required"> })
  | ({
      component: "SurveyTextarea"
      componentType: "form"
      validation:
        | (typeof fieldValidationEnum)["optionalString"]
        | (typeof fieldValidationEnum)["requiredString"]
        | (typeof fieldValidationEnum)["conditionalRequiredString"]
      defaultValue: string
    } & FormFieldBase & { props: Omit<ComponentProps<typeof SurveyTextarea>, "required"> })
  | ({
      component: "SurveySimpleMapWithLegend"
      componentType: "form"
      validation: (typeof fieldValidationEnum)["conditionalRequiredLatLng"]
      defaultValue: object | null
    } & FormFieldBase & {
        props: Omit<ComponentProps<typeof SurveySimpleMapWithLegend>, "required">
      })
  | ({
      component: "SurveyCheckbox"
      componentType: "form"
      validation: (typeof fieldValidationEnum)["requiredBoolean"]
      defaultValue: boolean
    } & FormFieldBase & {
        props: Omit<ComponentProps<typeof SurveyCheckbox>, "required">
      })
  | ({
      component: "SurveyCheckboxGroup"
      componentType: "form"
      validation:
        | (typeof fieldValidationEnum)["optionalArrayOfString"]
        | (typeof fieldValidationEnum)["requiredArrayOfString"]
        | (typeof fieldValidationEnum)["requiredArrayOfStringMin2"]
        | (typeof fieldValidationEnum)["optionalArrayOfStringMax3"]
      defaultValue: Array<string>
    } & FormFieldBase & {
        props: Omit<ComponentProps<typeof SurveyCheckboxGroup>, "required">
      })
  | ({
      component: "SurveyRadiobuttonGroup"
      componentType: "form"
      validation:
        | (typeof fieldValidationEnum)["optionalString"]
        | (typeof fieldValidationEnum)["requiredString"]
        | (typeof fieldValidationEnum)["conditionalRequiredString"]
      defaultValue: string
    } & FormFieldBase & {
        props: Omit<ComponentProps<typeof SurveyRadiobuttonGroup>, "required">
      })
  | ({
      component: "SurveyPageTitle"
      componentType: "content"
    } & ContentFieldBase & {
        props: ComponentProps<typeof SurveyPageTitle>
      })
  | ({
      component: "SurveyMarkdown"
      componentType: "content"
    } & ContentFieldBase & {
        props: ComponentProps<typeof SurveyMarkdown>
      })

// // tbd
// export type FormFieldConfig = Exclude<
//   FieldConfig,
//   { component: "SurveyPageTitle" } | { component: "SurveyMarkdown" }
// >
// // tbd
// export const surveyNonFomFields = ["SurveyPageTitle", "SurveyMarkdown"]

export type FormPage = {
  id: string
  fields: [FieldConfig, ...FieldConfig[]]
}

export type Stage = "part1" | "part2" | "part3" | "end"

export type IntroButton = {
  label: string
  action: Stage | "next"
  color?: "primaryColor" | "white"
  position: "left" | "right"
}

export type TIntro =
  | {
      type: "custom"
      customComponent: ReactNode
      buttons: IntroButton[]
    }
  | {
      type: "standard"
      title: string
      description: string
      buttons: IntroButton[]
    }

export type SurveyPart1and3 = {
  progressBarDefinition: number
  intro: TIntro
  buttonLabels: { next: string; back: string; submit: string }
  pages: [FormPage, ...FormPage[]]
}

export type SurveyPart2 = {
  progressBarDefinition: number
  intro: TIntro
  buttonLabels: { next: string; back: string; submit: string; again: string }
  // we want to type part2 has fields with id "location" "feedback"...
  // so checking field names across an array of objects
  // TypeScript can't fully enforce this constraint afaik
  // so maybe we have to just "tell" / overrule ts the backend that it can be sure that the pages contain the required fields
  pages: [FormPage, ...FormPage[]]
}

export type FormConfig = {
  meta: {
    version: number
    logoUrl: string
    canonicalUrl: string
    maptilerUrl: string
    tildaUrl?: string
    primaryColor: string
    darkColor: string
    lightColor: string
    // atm we only have "line" geometryCategoryType, coordinates are of type LineString or MultiLineString (the distinction between those two can be made by checking the shape of the first element in the coordinates array)
    // we define the geometryCategoryType explicilitly here as we might have "polygon" geometryCategoryTypes in the future we might have "polygon" geometryCategoryTypes
    // we can not store this information in the geometry atm
    // will be reworked with https://github.com/FixMyBerlin/private-issues/issues/2196
    geometryCategoryType: "line" | "polygon" | "point"
    // geometryFallback is used for surveys rs8 adn frm7 that have a geometry-category question
    // starting with radnetz BB all surveys have geometry-category questions
    geometryFallback?: LineString["coordinates"] | MultiLineString["coordinates"]
    // todo deletedQuestions
  }
  // fka survey part
  part1: SurveyPart1and3 | null
  // fka feedback part
  part2: SurveyPart2 | null
  // new survey like part
  part3: SurveyPart1and3 | null
  end: {
    progressBarDefinition: number
    title: string
    description?: string
    mailjetWidgetUrl: string | null
    homeUrl: string
    button: {
      label: string
      color?: "white" | "primaryColor"
    }
  }
  backend: TBackendConfig
}

export type SurveyFieldRadioOrCheckboxGroupConfig = Extract<
  FieldConfig,
  { component: "SurveyRadiobuttonGroup" } | { component: "SurveyCheckboxGroup" }
>

export type TResponseConfig = {
  evaluationRefs: {
    category: number
    enableLocation: number
    location: number
    feedbackText: number
    feedbackText_2?: number // survey RS8
    geometryCategory?: number // this is typed as optional because it is introduced in survey BB, for RS8 and FRM7 we use a fallback geometry-category
    "line-id"?: number // survey BB
    "line-from-to-name"?: number // survey BB
  }
}
