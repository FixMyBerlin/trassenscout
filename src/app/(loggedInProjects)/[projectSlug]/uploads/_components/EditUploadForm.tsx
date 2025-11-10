"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { Link } from "@/src/core/components/links"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import updateUpload from "@/src/server/uploads/mutations/updateUploadWithSubsections"
import getUploadWithSubsections from "@/src/server/uploads/queries/getUploadWithSubsections"
import { UploadSchema } from "@/src/server/uploads/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { useRouter } from "next/navigation"
import { UploadForm } from "./UploadForm"
import { UploadPreview } from "./UploadPreview"
import { splitReturnTo } from "./utils/splitReturnTo"

type Props = {
  upload: PromiseReturnType<typeof getUploadWithSubsections>
  subsections: SubsectionWithPosition[]
  projectSlug: string
  returnPath?: string
}

export const EditUploadForm = ({ upload, subsections, projectSlug, returnPath }: Props) => {
  const router = useRouter()
  const { subsectionSlug, subsubsectionSlug } = splitReturnTo({ returnPath })
  let backUrl = `/${projectSlug}/uploads`
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}`
  }

  const [updateUploadMutation] = useMutation(updateUpload)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateUploadMutation({
        ...values,
        id: upload.id,
        projectSlug,
      })
      // @ts-expect-error router push type works
      router.push(backUrl)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const isSubsubsectionUpload = Boolean(upload.subsubsectionId)

  return (
    <>
      <div className="flex gap-10">
        <UploadPreview upload={upload} description={false} />
        <UploadForm
          className="grow"
          submitText="Speichern"
          schema={UploadSchema}
          initialValues={upload}
          onSubmit={handleSubmit}
          subsections={subsections}
          isSubsubsectionUpload={isSubsubsectionUpload}
          uploadId={upload.id}
        />
      </div>

      <p className="mt-5">
        <Link href={backUrl}>
          {isSubsubsectionUpload ? "Zurück zum Eintrag" : "Zurück zu Dokumenten"}
        </Link>
      </p>

      <SuperAdminLogData data={{ upload, subsections }} />
    </>
  )
}
