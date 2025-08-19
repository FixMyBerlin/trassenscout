"use client"

import {
  Form,
  FormProps,
  LabeledCheckboxGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import createProtocolTopic from "@/src/server/protocol-topics/mutations/createProtocolTopic"
import getProtocolTopicsByProject from "@/src/server/protocol-topics/queries/getProtocolTopicsByProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useState } from "react"
import { z } from "zod"

type Props<S extends z.ZodType<any, any>> = FormProps<S>

export function ProtocolForm<S extends z.ZodType<any, any>>({ ...props }: Props<S>) {
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ protocolTopics }, { refetch }] = useQuery(getProtocolTopicsByProject, {
    projectSlug,
  })
  const [newTopic, setNewTopic] = useState("")
  const [createProtocolTopicMutation] = useMutation(createProtocolTopic)
  // const [selectedProtocolTopics, setSelectedProtocolTopics] = useState(protocolTopics.map(String))

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
      // setSelectedProtocolTopics([...selectedProtocolTopics, String(createdOrFetched.id)])
      refetch()
    } catch (error: any) {
      console.error(error)
    }
    setNewTopic("")
  }
  return (
    <Form<S> {...props}>
      <LabeledTextField type="date" name="date" label="am/bis" placeholder="" />
      <LabeledTextField name="title" label="Titel" />
      <LabeledTextareaField name="description" optional label="Niederschrift (Markdown)" />
      {subsectionOptions.length > 0 && (
        <LabeledSelect
          optional
          name="subsectionId"
          options={subsectionOptions}
          label="Planungsabschnitt"
        />
      )}

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
    </Form>
  )
}
