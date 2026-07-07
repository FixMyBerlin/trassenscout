import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import "react-datasheet-grid/dist/style.css"
import {
  Column,
  createAddRowsComponent,
  DataSheetGrid,
  keyColumn,
  textColumn,
} from "react-datasheet-grid"
import { ObjectDump } from "@/src/components/admin/ObjectDump"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { isProduction } from "@/src/components/core/utils/isEnv"
import { createContactFn, updateContactFn } from "@/src/server/contacts/contacts.functions"
import { contactsQueryOptions } from "@/src/server/contacts/contactsQueryOptions"
import type { ContactsResult } from "@/src/server/contacts/types"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Row = {
  id: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  note: string | null
  role: string | null
}

const prepareData = (data: ContactsResult | undefined) => {
  if (!data) return []
  return data.contacts.map(({ id, firstName, lastName, email, phone, note, role }) => ({
    id: String(id),
    firstName,
    lastName,
    email,
    phone,
    note,
    role,
  })) satisfies Row[]
}

export const ContactsTable = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const [formDirty, setFormDirty] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const { data: contactsResult } = useSuspenseQuery(contactsQueryOptions({ projectSlug }))
  const [data, setData] = useState<Row[]>(() => prepareData(contactsResult))
  const [errors, setErrors] = useState<[string, string][]>([])

  const createContactMutation = useMutation({ mutationFn: createContactFn })
  const updateContactMutation = useMutation({ mutationFn: updateContactFn })

  const AddRows = createAddRowsComponent({ button: "hinzufügen", unit: "Zeile(n)" })
  const NEW_ID_VALUE = "NEU"

  const columns: Column<Row>[] = [
    { ...keyColumn<Row, "id">("id", textColumn), title: "ID", disabled: true, maxWidth: 60 },
    { ...keyColumn<Row, "firstName">("firstName", textColumn), title: "Vorname" },
    { ...keyColumn<Row, "lastName">("lastName", textColumn), title: "Nachname (Pflicht)" },
    { ...keyColumn<Row, "email">("email", textColumn), title: "E-Mail-Adresse (Pflicht)" },
    { ...keyColumn<Row, "phone">("phone", textColumn), title: "Telefonnummer" },
    { ...keyColumn<Row, "note">("note", textColumn), title: "Notizen" },
    { ...keyColumn<Row, "role">("role", textColumn), title: "Position" },
  ]

  const handleUpdate = async () => {
    setErrors([])
    let refetchData = false

    for (const { id, lastName, email, ...value } of data) {
      if (!lastName || !email) {
        setErrors((prev) => [
          ...prev,
          [String(id || NEW_ID_VALUE), "Nachname und E-Mail-Adresse sind Pflichtfelder."],
        ])
        continue
      }

      try {
        if (!id || id === NEW_ID_VALUE) {
          await createContactMutation.mutateAsync({
            data: { ...value, lastName, email, projectSlug, tags: [] },
          })
        } else {
          await updateContactMutation.mutateAsync({
            data: { ...value, lastName, email, projectSlug, id: Number(id), tags: [] },
          })
        }
        refetchData = true
      } catch (error) {
        refetchData = false
        setErrors((prev) => [
          ...prev,
          [String(id) || NEW_ID_VALUE, String(improveErrorMessage(error, "FORM_ERROR", ["email"]))],
        ])
      }
    }

    if (refetchData) {
      if (!isProduction) {
        console.log("INFO", "update and create both where successfull, so refetching the data now")
      }
      await queryClient.invalidateQueries({ queryKey: ["contacts", { projectSlug }] })
      const refreshed = await queryClient.fetchQuery(contactsQueryOptions({ projectSlug }))
      setData(prepareData(refreshed))
      setFormDirty(false)
      setIsSaved(true)
    }
  }

  return (
    <>
      <Link className="pb-4" to={`/${projectSlug}/contacts`}>
        Zurück zu externen Kontakten
      </Link>
      <div className="mb-5 flex w-full items-start justify-between gap-5">
        {errors.length > 0 ? (
          <ul className="text-red-800">
            {errors.map(([id, errorMessage]) => (
              <li key={id} className="flex items-start gap-3">
                <strong>ID {id}</strong>
                <div>
                  <p>{errorMessage}</p>
                  <ObjectDump data={{ id, errors: errorMessage }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div />
        )}

        <ButtonWrapper className="justify-end">
          {!formDirty && isSaved && <span className="text-green-500">Gespeichert</span>}
          <button
            onClick={() => void handleUpdate()}
            className={primaryButtonClassName}
            disabled={!formDirty}
          >
            Speichern
          </button>
        </ButtonWrapper>
      </div>
      <DataSheetGrid
        value={data}
        addRowsComponent={AddRows as never}
        createRow={() => ({
          id: NEW_ID_VALUE,
          firstName: null,
          lastName: null,
          email: null,
          phone: null,
          note: null,
          role: null,
        })}
        onChange={(values) => {
          setFormDirty(true)
          setIsSaved(false)
          setData(values)
        }}
        columns={columns}
      />
    </>
  )
}
