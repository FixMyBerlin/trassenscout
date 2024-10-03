"use client"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import { quote } from "@/src/core/components/text/quote"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import updateSubsectionsWithFeltData from "@/src/server/subsections/mutations/updateSubsectionsWithFeltData"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = { project: Awaited<ReturnType<typeof getProject>> }

export const SubsectionFelt = ({ project }: Props) => {
  const [error, setError]: any | null = useState(null)
  const [isFetching, setIsFetching] = useState(false)

  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [{ subsections }, { refetch }] = useQuery(getSubsections, { projectSlug })
  const [updateSubsectionMutation] = useMutation(updateSubsectionsWithFeltData)

  const handleFeltDataClick = async () => {
    if (!project.felt_subsection_geometry_source_url) {
      window.alert("Keine Felt URL")
      return console.error("No Felt URL")
    }
    setIsFetching(true)

    try {
      const subsectionIds = await updateSubsectionMutation(
        {
          subsections,
          projectFeltUrl: project.felt_subsection_geometry_source_url,
        },
        {
          onSuccess: () => {
            refetch()
            setIsFetching(false)
            setError(null)
          },
        },
      )
      // @ts-expect-error ???
      router.push({ query: { updatedIds: subsectionIds?.join(",") } })
    } catch (error: any) {
      setError(error)
      return console.error(error)
    }
  }

  return (
    <section className="mt-10 rounded bg-white p-3">
      {project.felt_subsection_geometry_source_url ? (
        <>
          <button disabled={isFetching} className={blueButtonStyles} onClick={handleFeltDataClick}>
            Daten von Felt übernehmen
          </button>

          {error && (
            <div role="alert" className="mt-8 rounded bg-red-50 px-2 py-1 text-base text-red-800">
              Es ist ein Fehler aufgetreten:
              <br />
              {quote(error.toString())}
              <br />
              Überprüfe die Felt-Url des Projekts.
            </div>
          )}

          <Link button="blue" blank href={project.felt_subsection_geometry_source_url}>
            Geometrien in Felt bearbeiten
          </Link>
        </>
      ) : (
        <div className="flex flex-col justify-end">
          <Link href={`/${project.slug}/edit`}>
            Um die Geometrien der Planungsabschnitte in Felt zu bearbeiten, hier die Felt-Url für
            die Trasse angeben.
          </Link>
        </div>
      )}
    </section>
  )
}
