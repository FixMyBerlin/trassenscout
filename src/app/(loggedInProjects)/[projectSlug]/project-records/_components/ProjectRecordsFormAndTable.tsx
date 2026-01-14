"use client"

import { FilteredProjectRecords } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/FilteredProjectRecords"
import { ProjectRecordNewModal } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNewModal"
import { useFilters } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/filter/useFilters.nuqs"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { useInitialFormValues } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/useInitialFormValues.nuqs"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { FORM_ERROR } from "@/src/core/components/forms"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/16/solid"
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
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)

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
    <div className="relative flex flex-col gap-8">
      <IfUserCanEdit>
        <div>
          <button
            onClick={() => setIsProjectRecordModalOpen(true)}
            className={clsx(blueButtonStyles, "items-center justify-center gap-1")}
          >
            <PlusIcon className="size-3.5" /> Neuer Protokolleintrag
          </button>
        </div>
      </IfUserCanEdit>

      <ProjectRecordNewModal
        projectSlug={projectSlug}
        open={isProjectRecordModalOpen}
        onClose={() => setIsProjectRecordModalOpen(false)}
        onSuccess={async (projectRecordId) => {
          setCreatedProjectRecordId(projectRecordId)
          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            setCreatedProjectRecordId(null)
          }, 3000)
          await refetch()
        }}
      />
      <div className="absolute top-0 right-0">
        <FormSuccess message="Neuen Protokolleintrag erstellt" show={showSuccess} />
      </div>
      <FilteredProjectRecords
        highlightId={createdProjectRecordId}
        projectRecords={projectRecords}
      />
    </div>
  )
}
