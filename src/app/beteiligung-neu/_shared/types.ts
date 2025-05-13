import { SurveyCheckbox } from "@/src/app/beteiligung-neu/_components/form/Checkbox"
import { SurveyCheckboxGroup } from "@/src/app/beteiligung-neu/_components/form/CheckboxGroup"
import { SurveySimpleMapWithLegend } from "@/src/app/beteiligung-neu/_components/form/map/SimpleMapWithLegend"
import { SurveyPageTitle } from "@/src/app/beteiligung-neu/_components/form/PageTitle"
import { SurveyRadiobuttonGroup } from "@/src/app/beteiligung-neu/_components/form/RadiobuttonGroup"
import { SurveyTextarea } from "@/src/app/beteiligung-neu/_components/form/Textarea"
import { SurveyTextfield } from "@/src/app/beteiligung-neu/_components/form/Textfield"
import { SurveyMarkdown } from "@/src/app/beteiligung-neu/_components/layout/SurveyMarkdown"
import { AnyFieldApi } from "@tanstack/react-form"

import { LineString, MultiLineString } from "geojson"
import { ComponentProps, ReactNode } from "react"
import { ZodType } from "zod"

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
      // componentType tbd
      componentType: "form"
      zodSchema: ZodType<string> | ZodType<string | undefined | null>
      defaultValue: string
    } & FormFieldBase & { props: ComponentProps<typeof SurveyTextfield> })
  | ({
      component: "SurveyTextarea"
      componentType: "form"
      zodSchema: ZodType<string> | ZodType<string | undefined | null>
      defaultValue: string
    } & FormFieldBase & { props: ComponentProps<typeof SurveyTextarea> })
  | ({
      component: "SurveySimpleMapWithLegend"
      componentType: "form"
      zodSchema: ZodType<object | null | undefined> // actually it will always be the same schema for this custom component, so we do not actually need to configure it...; but for simplicity I leave it like this for now
      defaultValue: object | null
    } & FormFieldBase & { props: ComponentProps<typeof SurveySimpleMapWithLegend> })
  | ({
      component: "SurveyCheckbox"
      componentType: "form"
      zodSchema: ZodType<boolean | undefined>
      defaultValue: boolean
    } & FormFieldBase & {
        props: ComponentProps<typeof SurveyCheckbox>
      })
  | ({
      component: "SurveyCheckboxGroup"
      componentType: "form"
      zodSchema: ZodType<Array<string>>
      defaultValue: Array<string>
    } & FormFieldBase & {
        props: ComponentProps<typeof SurveyCheckboxGroup>
      })
  | ({
      component: "SurveyRadiobuttonGroup"
      componentType: "form"
      zodSchema: ZodType<string>
      defaultValue: string
    } & FormFieldBase & {
        props: ComponentProps<typeof SurveyRadiobuttonGroup>
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
  // todo
  // tbd
  // we need to type that part2 always has fields with id "location" "feedback"...
  // so checking field names across an array of objects
  // TypeScript can't fully enforce this constraint afaik
  // so maybe we have to just "tell" the backend that it can be sure that the pages contain the required fields
  pages: [FormPage, ...FormPage[]]
}

export type FormConfig = {
  meta: {
    version: number
    logoUrl: string
    canonicalUrl: string
    maptilerUrl: string
    primaryColor: string
    darkColor: string
    lightColor: string
    // atm we only have "line" geometryCategoryType, coordinates are of type LineString or MultiLineString (the distinction between those two can be made by checking the shape of the first element in the coordinates array)
    // we define the geometryCategoryType explicilitly here as we might have "polygon" geometryCategoryTypes in the future we might have "polygon" geometryCategoryTypes
    // we can not store this information in the geometry atm
    // will be reworked with https://github.com/FixMyBerlin/private-issues/issues/2196
    geometryCategoryType: "line" | "polygon"
    // geometryFallback is used for surveys rs8 adn frm7 that have a geometry-category question
    // starting with radnetz BB all surveys have geometry-category questions
    geometryFallback?: LineString["coordinates"] | MultiLineString["coordinates"]
    // todo deletedQuestions
  }
  // todo make parts optional
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
}
