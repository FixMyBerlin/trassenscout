"use client"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { blueButtonStyles, Link, selectLinkStyle } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { isProduction } from "@/src/core/utils"
import getProject from "@/src/server/projects/queries/getProject"
import updateSubsectionsWithPlacemark from "@/src/server/subsections/mutations/updateSubsectionsWithPlacemark"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { FeatureCollectionSchema } from "@/src/server/subsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

type Props = { project: Awaited<ReturnType<typeof getProject>> }

export const SubsectionPlacemarkImport = ({ project }: Props) => {
  type TFeatureCollectionSchema = z.infer<typeof FeatureCollectionSchema>
  type FileUploadState = "INITIAL" | "FILE_SELECTED"
  const [fileState, setFileState] = useState<FileUploadState>("INITIAL")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<TFeatureCollectionSchema | null>(null)
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [updateSubsectionMutation] = useMutation(updateSubsectionsWithPlacemark)

  const handleUpdateDataClick = async () => {
    if (!fileContent) return
    try {
      const subsectionIds = await updateSubsectionMutation({
        subsections,
        newGeometry: fileContent,
      })
      router.push(
        `/admin/projects/${projectSlug}/subsections?updatedIds=${subsectionIds?.join(",")}`,
      )
    } catch (error: any) {
      console.log("error")
      return console.error(error)
    }
  }

  const placemarkPlayUrl = `https://play.placemark.io/?load=https://${!isProduction && "staging."}trassenscout.de/api/projects/${projectSlug}.json`

  const handleUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList
    const file = files[0]
    if (file) {
      try {
        const content = await file.text()
        const parsedContent = JSON.parse(content)
        console.log("Parsed Object:", parsedContent)
        const geoJson = FeatureCollectionSchema.parse(parsedContent)
        setFileContent(geoJson)
        setSelectedFile(file)
        setFileState("FILE_SELECTED")
      } catch (error) {
        console.error("Error parsing file:", error)
        alert("Invalid GeoJSON file.")
      }
    } else {
      setSelectedFile(null)
      setFileContent(null)
      setFileState("INITIAL")
    }
  }

  return (
    <section className="mt-10 rounded bg-white p-3">
      <div className="prose mb-8">
        <p>Prozess zum Aktualisieren der Geometrien der Planungsabschnitte eines Projekts:</p>
        <ol>
          <li>
            <strong>Nur für neue Planungsabschnitte:</strong>{" "}
            <Link blank href={`/admin/projects/${projectSlug}/subsections/multiple-new`}>
              Hier
            </Link>{" "}
            mehrere Planungsabschnitte gleichzeitig anlegen. Die Geometrien der neuen
            Planungsabschnitte werden mit einer Default-Geometrie angelegt.
          </li>
          <li>
            Export des Projekts{" "}
            <Link blank href="/admin/projects/">
              hier
            </Link>{" "}
            einschalten.
          </li>
          <li>
            Der Button unten `Geometrien in Placemark Play bearbeiten` öffnet alle Geometrien der
            Planungsabschnitte dieses Projekts in Placemark Play. Dort Geometrien bearbeiten. Alle
            neu angelegten Planungsabschnitte sind an ihrer Default-Geometrie zu erkennen. Diese
            bearbeiten oder löschen und neu anlegen - für den Re-import{" "}
            <strong>
              wichtig: die property `subsectionSlug` der Geometrie in Placemark Play muss mit dem
              `slug` des Planungsabschnitts im TS übereinstimmen.
            </strong>{" "}
            <Link blank href={`/admin/projects/${projectSlug}/subsections`}>
              Hier
            </Link>{" "}
            in der Übersicht, kann der `slug` des Planungsabschnitts eingesehen und kopiert werden.
          </li>
          <li>
            Die bearbeiteten Geometrien in Placemark Play `File` - `Export` als GeoJSON speichern.
          </li>
          <li>
            Die gespeicherte GeoJSON-Datei hier über `Datei auswählen` auswählen und auf `Geometrien
            der Planungsabschnitte ersetzen` klicken, um die Geometrien der Planungsabschnitte zu
            aktualisieren.{" "}
            <strong>
              Wichtig: Die Geometrien der Planungsabschnitte im TS werden durch die Geometrien in
              der hochgeladenen Datei ersetzt.
            </strong>{" "}
            Dies passiert lediglich für die Planungsabshcnitte, für die in der Datei ein Feature mit
            dem übereinstimmenden Slug gefunden wird.
          </li>
          <li>
            In der{" "}
            <Link blank href={`/admin/projects/${projectSlug}/subsections`}>
              Übersicht der Planungsabschnitte
            </Link>{" "}
            sind die aktualisierten Planungsabschnitte danach blau hinterlegt.
          </li>
        </ol>
      </div>

      {project.exportEnabled ? (
        <Link button="blue" blank href={placemarkPlayUrl}>
          Geometrien in Placemark Play bearbeiten
        </Link>
      ) : (
        <div>
          Um mehrere Geometrien gleichzeitig in Placemark Play zu bearbeiten, muss der Geometrie
          Export des Projekts <Link href="/admin/projects/">hier</Link> eingeschaltet werden.
        </div>
      )}
      <div className="mt-8">
        {["FILE_SELECTED"].includes(fileState) && (
          <div className="rounded-lg border px-4 py-2">
            Ausgewählte Datei: <strong>{selectedFile!.name}</strong>
          </div>
        )}
        <ButtonWrapper className="mt-10">
          {["INITIAL", "FILE_SELECTED"].includes(fileState) && (
            <form>
              <label
                htmlFor="file-upload"
                className={clsx(
                  selectedFile ? selectLinkStyle("white") : selectLinkStyle("blue"),
                  "cursor-pointer",
                )}
              >
                {selectedFile ? "Andere Datei auswählen" : "Datei auswählen"}
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleUploadChange}
                accept="application/json,.geojson"
              />
            </form>
          )}
          {["FILE_SELECTED"].includes(fileState) && (
            <button className={blueButtonStyles} onClick={handleUpdateDataClick}>
              Geometrien der Planungsabschnitte ersetzen
            </button>
          )}
        </ButtonWrapper>

        <SuperAdminBox className="prose-xs prose">
          <p>
            state: <code>{fileState}</code>
          </p>
          {["FILE_SELECTED"].includes(fileState) && (
            <p>
              type: <code>{selectedFile!.type}</code>
              <br />
              size: <code>{selectedFile!.size}</code>
              <br />
            </p>
          )}
        </SuperAdminBox>
      </div>
    </section>
  )
}
