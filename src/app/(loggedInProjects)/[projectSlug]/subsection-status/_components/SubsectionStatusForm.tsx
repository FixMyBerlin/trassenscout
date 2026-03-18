import { subsectionStatusStyleTranslations } from "@/src/app/(loggedInProjects)/[projectSlug]/subsection-status/_utils/statusStyleTranslations"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { SubsectionStatusStyleEnum } from "@prisma/client"
import { z } from "zod"

export function SubsectionStatusForm<S extends z.ZodType<any, any>>(
  props: Omit<FormProps<S>, "children">,
) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      {(form) => (
        <>
          <LabeledTextField form={form} type="text" name="slug" label="Kürzel" />
          <LabeledTextField form={form} type="text" name="title" label="Titel" />
          <LabeledRadiobuttonGroup
            form={form}
            label="Darstellung"
            scope="style"
            items={Object.entries(SubsectionStatusStyleEnum).map(([_key, value]) => ({
              value,
              label: subsectionStatusStyleTranslations[value],
            }))}
            classNameItemWrapper="flex gap-5 space-y-0! items-center"
          />
        </>
      )}
    </Form>
  )
}
