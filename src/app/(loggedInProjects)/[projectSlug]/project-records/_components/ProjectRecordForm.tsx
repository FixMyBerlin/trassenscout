"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { Disclosure } from "@/src/core/components/Disclosure"
import { Form, FormProps } from "@/src/core/components/forms"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { H3 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import clsx from "clsx"
import { z } from "zod"

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  mode: "new" | "edit"
}

export function ProjectRecordForm<S extends z.ZodType<any, any>>({ mode, ...props }: Props<S>) {
  const projectSlug = useProjectSlug()

  if (mode === "new") {
    return (
      <Form<S> {...props}>
        <div>
          <Disclosure
            classNameButton="py-4 px-6 text-left bg-gray-100 rounded-t-md pb-6"
            classNamePanel="px-6 pb-3 bg-gray-100 rounded-b-md space-y-6"
            open
            button={
              <div className="flex-auto">
                <H3 className={clsx("pr-10 md:pr-0")}>Neuer Protokolleintrag</H3>
                <small>
                  Neuen Protokolleintrag verfassen. Zum Ein- oder Ausklappen auf den Pfeil oben
                  rechts klicken.
                </small>
              </div>
            }
          >
            <ProjectRecordFormFields projectSlug={projectSlug} />
            <SubmitButton>Protokoll speichern</SubmitButton>
          </Disclosure>
        </div>
      </Form>
    )
  }

  return (
    <Form<S> {...props}>
      <div className="space-y-6">
        <ProjectRecordFormFields projectSlug={projectSlug} />
      </div>
    </Form>
  )
}
