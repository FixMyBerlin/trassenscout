"use client"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { blueButtonStyles, Link, selectLinkStyle } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import updateSubsectionsWithPlacemark from "@/src/server/subsections/mutations/updateSubsectionsWithPlacemark"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { FeatureCollectionSchema } from "@/src/server/subsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { defaultGeometryForMultipleSubsectionForm } from "../multiple-new/_components/MultipleNewSubsectionsForm"

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
        projectSlug: project.slug,
      })
      router.push(
        `/admin/projects/${projectSlug}/subsections?updatedIds=${subsectionIds?.join(",")}`,
      )
    } catch (error: any) {
      console.log("error")
      return console.error(error)
    }
  }

  const placemarkPlayUrl = new URL("https://play.placemark.io")
  placemarkPlayUrl.searchParams.append(
    "load",
    `${getPrdOrStgDomain()}/api/projects/${projectSlug}.json`,
  )

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
        <h2>Prozess zum Aktualisieren der Geometrien der Planungsabschnitte eines Projekts:</h2>
        <h3>Vorbedingung</h3>
        <ol>
          <li>
            Export-API für das Projekt aktivieren{" "}
            <Link href={`/${projectSlug}/edit/`} blank>
              unter Projekt bearbeiten &ldquo;✔️ Export-API aktiv&rdquo;
            </Link>
            .<br />
            {project.exportEnabled ? (
              <span className="text-green-600">Aktuell ist der Export aktiv.</span>
            ) : (
              <span className="text-red-600">Aktuell ist der Export inaktiv!</span>
            )}
          </li>
        </ol>
        <h3>Vorbereitung für neue Planungsabschnitte</h3>
        <ol>
          <li>
            <strong>
              <Link blank href={`/admin/projects/${projectSlug}/subsections/multiple-new`}>
                Mehrere Planungsabschnitte gleichzeitig anlegen
              </Link>
            </strong>
            .
          </li>
        </ol>

        <p>
          Die Abschnitte bekommen Platzhalter-Geometrien, die durch den Upload ersetzt werden.
          Wichtig sind die <code>slug</code>s, die als Referenz im GeoJSON dienen.
          <br />
          <strong>Planungsabschnitte mit Platzhalter-Geometrie:</strong>
        </p>

        {subsections
          .filter((subsection) => {
            return (
              String(subsection.geometry) === defaultGeometryForMultipleSubsectionForm.join(",")
            )
          })
          .map((subsection) => {
            return (
              <li key={subsection.slug}>
                <Link href={`/${projectSlug}/abschnitte/${subsection.slug}/edit`}>
                  {subsection.slug}
                </Link>
              </li>
            )
          })}

        <h3>Aktualisierung der Geometrien</h3>
        <ol>
          <li>
            Über den Button &ldquo;Geometrien in Placemark Play öffnen&rdquo; alle Geometrien der
            Planungsabschnitte dieses Projekts in Placemark Play öffnen.
          </li>
          <li>
            Die Geometrien in Placemark Play bearbeiten. Alle neu angelegten Planungsabschnitte sind
            an ihrer Default-Geometrie zu erkennen. Diese bearbeiten oder löschen und neu anlegen.
            <br />
            Wichtig: Die Property <code>subsectionSlug</code> muss mit dem <code>slug</code> des
            Planungsabschnittes übereinstimmen.
            <br />
            Hinweis: Alle anderen Properties können ignoriert werden, da der Upload sie auch
            ignorieren wird.
          </li>
          <li>
            Die bearbeiteten Geometrien in Placemark Play über &ldquo;File&rdquo; -
            &ldquo;Export&rdquo; als GeoJSON speichern.
          </li>
          <li>
            Die GeoJSON-Datei unten über &ldquo;Neues Geojson hochladen&rdquo; auswählen und auf
            &ldquo;Geometrien der Planungsabschnitte ersetzen&rdquo; klicken, um die bestehenden
            Geometrien zu ersetzen.
            <br />
            Hinweis: Es werden nur die Planungsabschnitte aktualisiert, für die eine passende
            Geometrie gefunden wurde. Wurden Geometrien gelöscht, müssen die zugehörigen
            Planungsabschnitte manuell gelöscht werden.
          </li>
          <li>Nach dem Ersetzen zeigt eine Seite an, welche Daten aktualisiert wurden.</li>
        </ol>
      </div>

      {project.exportEnabled ? (
        <Link button="blue" blank href={placemarkPlayUrl.toString()}>
          Geometrien in Placemark Play öffnen
        </Link>
      ) : (
        <Link button="blue" blank href={"#inactive"} className="line-through">
          Geometrien in Placemark Play öffnen – EXPORT API INAKTIV
        </Link>
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
                {selectedFile ? "Anderes Geojson hochladen" : "Neues Geojson hochladen"}
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
