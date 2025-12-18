"use client"

import { FilteredProjectRecords } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/FilteredProjectRecords"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { useFilters } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/filter/useFilters.nuqs"
import { useInitialFormValues } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/useInitialFormValues.nuqs"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Disclosure } from "@/src/core/components/Disclosure"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { H3 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { NewProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useEffect, useState } from "react"

export const ProjectRecordsFormAndTable = ({
  initialProjectRecords,
}: {
  initialProjectRecords: Awaited<ReturnType<typeof getProjectRecords>>
}) => {
  const projectSlug = useProjectSlug()
  const [projectRecords, { refetch }] = useQuery(
    getProjectRecords,
    { projectSlug },
    // todo check if this works as expected
    { initialData: initialProjectRecords },
  )
  const [createProjectRecordMutation] = useMutation(createProjectRecord)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const { setFilter } = useFilters()
  const { initialFormValues, setInitialFormValues } = useInitialFormValues()

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => {
        setShowSuccess(false)
        setCreatedProjectRecordId(null)
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [showSuccess])

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    console.log({ values })
    try {
      const projectRecord = await createProjectRecordMutation({
        ...values,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
      })
      refetch()
      setShowSuccess(true)
      setCreatedProjectRecordId(projectRecord.id)
      setFilter({ searchterm: "" })
      setInitialFormValues(null)
      setTimeout(() => window.scrollTo(0, 0), 150)
    } catch (error: any) {
      // todo ?
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  const formInitialValues = {
    date: getDate(new Date()),
    // Set initial form values based on URL params
    ...(initialFormValues?.subsubsectionId && {
      subsubsectionId: initialFormValues.subsubsectionId,
    }),
  }

  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <FormSuccess message="Neues Protokoll erstellt" show={showSuccess} />
      </div>
      <FilteredProjectRecords
        highlightId={createdProjectRecordId}
        projectRecords={projectRecords}
      />
      <IfUserCanEdit>
        <Form
          resetOnSubmit
          onSubmit={handleSubmit}
          initialValues={formInitialValues}
          schema={NewProjectRecordFormSchema}
        >
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
      </IfUserCanEdit>
    </div>
  )
}
