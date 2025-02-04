"use client"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import { quote } from "@/src/core/components/text/quote"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import updateSubsectionsWithPlacemark from "@/src/server/subsections/mutations/updateSubsectionsWithPlacemark"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = { project: Awaited<ReturnType<typeof getProject>> }

export const SubsectionPlacemarkImport = ({ project }: Props) => {
  const [error, setError]: any | null = useState(null)
  const [isFetching, setIsFetching] = useState(false)

  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [{ subsections }, { refetch }] = useQuery(getSubsections, { projectSlug })
  const [updateSubsectionMutation] = useMutation(updateSubsectionsWithPlacemark)

  const handlePlacemarkDataClick = async () => {
    if (!project.placemarkUrl) {
      window.alert("Keine Placemark URL")
      return console.error("No Placemark URL")
    }
    setIsFetching(true)

    try {
      const subsectionIds = await updateSubsectionMutation(
        {
          subsections,
          projectPlacemarkUrl: project.placemarkUrl,
        },
        {
          onSuccess: () => {
            void refetch()
            setIsFetching(false)
            setError(null)
          },
        },
      )
      router.push(
        `/admin/projects/${projectSlug}/subsections?updatedIds=${subsectionIds?.join(",")}`,
      )
    } catch (error: any) {
      setError(error)
      return console.error(error)
    }
  }

  return (
    <section className="mt-10 rounded bg-white p-3">
      {project.placemarkUrl ? (
        <>
          <button
            disabled={isFetching}
            className={blueButtonStyles}
            onClick={handlePlacemarkDataClick}
          >
            Daten von Placemark übernehmen
          </button>

          {error && (
            <div role="alert" className="mt-8 rounded bg-red-50 px-2 py-1 text-base text-red-800">
              Es ist ein Fehler aufgetreten:
              <br />
              {quote(error.toString())}
              <br />
              Überprüfe die Placemark-Url des Projekts.
            </div>
          )}

          <Link button="blue" blank href={project.placemarkUrl}>
            Geometrien in Placemark bearbeiten
          </Link>
        </>
      ) : (
        <div className="flex flex-col justify-end">
          <Link blank href={`/${project.slug}/edit`}>
            Um die Geometrien der Planungsabschnitte in Placemark zu bearbeiten, hier die
            Placemark-Url für die Trasse angeben.
          </Link>
        </div>
      )}
    </section>
  )
}
