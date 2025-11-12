"use client"

import { FilteredProjectRecords } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/FilteredProjectRecords"
import { ProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordForm"
import { useFilters } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/useFilters.nuqs"
import { useInitialFormValues } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/useInitialFormValues.nuqs"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { FORM_ERROR } from "@/src/core/components/forms"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { useMutation, useQuery } from "@blitzjs/rpc"
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

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
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
      scrollToElement("toast")
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
    <>
      <IfUserCanEdit>
        <ProjectRecordForm
          resetOnSubmit
          onSubmit={handleSubmit}
          initialValues={formInitialValues}
          mode="new"
        />
        <div className="mb-4 pt-4" id="toast">
          <FormSuccess message="Neues Protokoll erstellt" show={showSuccess} />
        </div>
      </IfUserCanEdit>
      <FilteredProjectRecords
        highlightId={createdProjectRecordId}
        projectRecords={projectRecords}
      />
    </>
  )
}
