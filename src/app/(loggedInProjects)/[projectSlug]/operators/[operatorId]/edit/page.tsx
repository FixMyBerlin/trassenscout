import { EditOperatorForm } from "@/src/app/(loggedInProjects)/[projectSlug]/operators/_components/EditOperatorForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getOperator from "@/src/server/operators/queries/getOperator"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Baulastträger"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; operatorId: string }
}

export default async function EditOperatorPage({ params: { projectSlug, operatorId } }: Props) {
  const operator = await invoke(getOperator, {
    projectSlug,
    id: Number(operatorId),
  })

  return (
    <>
      <PageHeader title="Baulastträger bearbeiten" className="mt-12" />
      <EditOperatorForm operator={operator} projectSlug={projectSlug} />
    </>
  )
}
