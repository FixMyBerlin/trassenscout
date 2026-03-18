import { subsubsectionStatusStyleTranslations } from "@/src/app/(loggedInProjects)/[projectSlug]/subsection-status/_utils/statusStyleTranslations"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { SubsubsectionStatusStyleEnum } from "@prisma/client"
import { z } from "zod"

export function SubsubsectionStatusForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
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
            items={Object.entries(SubsubsectionStatusStyleEnum).map(([_key, value]) => ({
              value,
              label: subsubsectionStatusStyleTranslations[value],
            }))}
            classNameItemWrapper="flex gap-5 space-y-0! items-center"
          />
        </>
      )}
    </Form>
  )
}
