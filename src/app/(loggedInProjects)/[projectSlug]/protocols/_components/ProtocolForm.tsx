"use client"

import { Disclosure } from "@/src/core/components/Disclosure"
import {
  Form,
  FormProps,
  LabeledCheckboxGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { blueButtonStyles } from "@/src/core/components/links"
import { H3 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import createProtocolTopic from "@/src/server/protocol-topics/mutations/createProtocolTopic"
import getProtocolTopicsByProject from "@/src/server/protocol-topics/queries/getProtocolTopicsByProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useState } from "react"
import { z } from "zod"

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  mode: "new" | "edit"
}

const ProtocolFormFields = () => {
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ protocolTopics }, { refetch }] = useQuery(getProtocolTopicsByProject, {
    projectSlug,
  })
  const [newTopic, setNewTopic] = useState("")
  const [createProtocolTopicMutation] = useMutation(createProtocolTopic)

  const topicsOptions = protocolTopics.length
    ? protocolTopics.map((t) => {
        return { value: String(t.id), label: t.title }
      })
    : []

  const subsectionOptions: [string | number, string][] = subsections.map((subsection) => [
    subsection.id,
    subsection.slug,
  ])
  subsectionOptions.unshift(["", "Keine Angabe"])

  const handleNewTopicFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    try {
      const createdOrFetched = await createProtocolTopicMutation({
        title: newTopic.trim(),
        projectSlug,
      })
      refetch()
    } catch (error: any) {
      console.error(error)
    }
    setNewTopic("")
  }

  return (
    <>
      <LabeledTextField type="date" name="date" label="am/bis" placeholder="" />

      <LabeledTextField name="title" label="Titel" />

      {subsectionOptions.length > 0 && (
        <LabeledSelect
          optional
          name="subsectionId"
          options={subsectionOptions}
          label="Planungsabschnitt"
        />
      )}
      <LabeledTextareaField name="body" optional label="Notizen (Markdown)" rows={10} />

      <div className="flex flex-col gap-3">
        <LabeledCheckboxGroup
          scope="protocolTopics"
          classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
          items={topicsOptions}
          label="Tags"
          optional
        />
        <div className="flex w-full items-end gap-2">
          <LabeledTextField
            onChange={(e) => setNewTopic(e.target.value)}
            value={newTopic}
            maxLength={35}
            name="newTopic"
            placeholder="Neues Tag"
            className={
              "block w-full flex-grow appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            }
            label=""
          />
          <button
            type="button"
            onClick={handleNewTopicFormSubmit}
            className={clsx(blueButtonStyles, "!h-3 !px-3")}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </>
  )
}

export function ProtocolForm<S extends z.ZodType<any, any>>({ mode, ...props }: Props<S>) {
  if (mode === "new") {
    return (
      <Form<S> {...props}>
        <div>
          <Disclosure
            classNameButton="py-4 px-6 text-left bg-gray-100 rounded-t-md pb-6"
            classNamePanel="px-6 pb-3 bg-gray-100 rounded-b-md space-y-6"
            open
            button={
              <div className="flex-auto">
                <H3 className={clsx("pr-10 md:pr-0")}>Neuer Protokolleintrag</H3>
                <small>
                  Neuen Protokolleintrag verfassen. Zum Ein- oder Ausklappen auf den Pfeil oben
                  rechts klicken.
                </small>
              </div>
            }
          >
            <ProtocolFormFields />
            <SubmitButton>Protokoll speichern</SubmitButton>
          </Disclosure>
        </div>
      </Form>
    )
  }

  return (
    <Form<S> {...props}>
      <div className="space-y-6">
        <ProtocolFormFields />
      </div>
    </Form>
  )
}
