"use client"
import { ObjectDump } from "@/src/app/admin/_components/ObjectDump"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, pinkButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { isProduction } from "@/src/core/utils"
import createContact from "@/src/server/contacts/mutations/createContact"
import updateContact from "@/src/server/contacts/mutations/updateContact"
import getContacts, { TContacts } from "@/src/server/contacts/queries/getContacts"
import { getQueryClient, getQueryKey, useMutation, useQuery } from "@blitzjs/rpc"
import { useState } from "react"
import { Column, DataSheetGrid, keyColumn, textColumn } from "react-datasheet-grid"
import "react-datasheet-grid/dist/style.css"

type Row = {
  id: string | null // Required
  firstName: string | null
  lastName: string | null // Required
  email: string | null // Required
  phone: string | null
  note: string | null
  role: string | null
}

export const ContactsTable = () => {
  const projectSlug = useProjectSlug()

  // To disable the automatic form refetching that useQuery does once we change something in the form.
  const [formDirty, setFormDirty] = useState(false)
  // This is hacky. We need to refetch the data after the mutation,
  // which we do by invalidating the query and using onSucess (in usePaginatedQuery) to set the fresh data.
  // However this breaks react during the first render, when `setData` is not present, yet.
  // The workaround is to manually manage this state and only allow the update when we hit save.
  const [performUpdate, setPerformUpdate] = useState(false)

  const prepareData = (data: TContacts | undefined) => {
    if (!data) return []
    return data.contacts.map(({ id, firstName, lastName, email, phone, note, role }) => {
      return { id: String(id), firstName, lastName, email, phone, note, role } satisfies Row
    })
  }

  const queryKey = getQueryKey(getContacts, { projectSlug })
  const [contacts] = useQuery(
    getContacts,
    { projectSlug },
    {
      enabled: !formDirty,
      onSuccess: (data) => {
        if (performUpdate) {
          setData(prepareData(data))
        }
      },
    },
  )

  const [data, setData] = useState<Row[]>(prepareData(contacts))
  const [errors, setErrors] = useState<[string, string][]>([])

  const [createContactMutation, { isSuccess: isCreateSuccess }] = useMutation(createContact)
  const [updateContactMutation, { isSuccess: isUpdateSuccess }] = useMutation(updateContact)

  const NEW_ID_VALUE = "NEU"
  const columns: Column<Row>[] = [
    {
      ...keyColumn<Row, "id">("id", textColumn),
      title: "ID",
      disabled: true,
      maxWidth: 60,
    },
    {
      ...keyColumn<Row, "firstName">("firstName", textColumn),
      title: "Vorname",
    },
    {
      ...keyColumn<Row, "lastName">("lastName", textColumn),
      title: "Nachname (Pflicht)",
    },
    {
      ...keyColumn<Row, "email">("email", textColumn),
      title: "E-Mail-Adresse (Pflicht)",
    },
    {
      ...keyColumn<Row, "phone">("phone", textColumn),
      title: "Telefonnummer",
    },
    {
      ...keyColumn<Row, "note">("note", textColumn),
      title: "Notizen (Markdown)",
    },
    {
      ...keyColumn<Row, "role">("role", textColumn),
      title: "Position",
    },
  ]

  const handleUpdate = async () => {
    // Reset Errors
    setErrors([])

    // Only refetch, if all changes are stored.
    // This allows us to manually show errors in the form and we can resubmit them.
    let refetchData = false

    for (const { id, lastName, email, ...value } of data) {
      // Manually handle "required" fields errors
      if (!lastName || !email) {
        setErrors((prev) => [
          ...prev,
          [String(id || NEW_ID_VALUE), "Nachname und E-Mail-Adresse sind Pflichtfelder."],
        ])
        continue
      }

      const createOrUpdateMutation =
        !id || id === NEW_ID_VALUE
          ? { action: createContactMutation, additionalData: {} }
          : { action: updateContactMutation, additionalData: { id: Number(id) } }

      await createOrUpdateMutation.action(
        // @ts-expect-error TS is not able to infer that `id` should not be part of `create`
        { ...value, lastName, email, projectSlug, ...createOrUpdateMutation.additionalData },
        {
          onError: (error, updatedContacts, context) => {
            refetchData = false
            console.log("ERROR", error, updatedContacts, context)
            setErrors((prev) => [
              ...prev,
              [
                String(id) || NEW_ID_VALUE,
                improveErrorMessage(error, "FORM_ERROR", ["email"]) as any,
              ],
            ])
          },
          onSuccess: () => {
            refetchData = true
          },
        },
      )
    }

    if (refetchData) {
      if (!isProduction) {
        console.log("INFO", "update and create both where successfull, so refetching the data now")
      }
      setPerformUpdate(true)
      setFormDirty(false)
      await getQueryClient().invalidateQueries(queryKey)
    }
  }

  return (
    <>
      <Link className="pb-4" href={`/${projectSlug}/contacts`}>
        Zurück zu externen Kontakten
      </Link>
      <div className="mb-5 flex w-full items-start justify-between gap-5">
        {errors.length > 0 ? (
          <ul className="text-red-800">
            {errors.map(([id, errors]) => {
              const strings: string[] =
                typeof errors === "object" ? Object.values(errors).filter(Boolean) : [errors]
              return (
                <li key={id} className="flex items-start gap-3">
                  <strong>ID {id}</strong>
                  <div>
                    {strings.map((string) => {
                      return <p key={string}>{string}</p>
                    })}
                    <ObjectDump data={{ id, errors }} />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div />
        )}

        <ButtonWrapper className="justify-end">
          {!formDirty && (isCreateSuccess || isUpdateSuccess) && (
            <span className="text-green-500">Gespeichert</span>
          )}
          <button onClick={handleUpdate} className={pinkButtonStyles} disabled={!formDirty}>
            Speichern
          </button>
        </ButtonWrapper>
      </div>
      <DataSheetGrid
        value={data}
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
          setData(values)
        }}
        columns={columns}
      />
    </>
  )
}
