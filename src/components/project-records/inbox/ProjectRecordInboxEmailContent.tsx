import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { ReactNode, useState } from "react"
import { twJoin } from "tailwind-merge"
import { z } from "zod"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import {
  ProjectRecordEmailSource,
  type ProjectRecordEmailSourceValue,
} from "@/src/components/project-records/ProjectRecordEmailSource"
import { ProjectRecordCreateForm } from "@/src/components/project-records/ProjectRecordNewModal"
import { useProjectRecordsListHeader } from "@/src/components/project-records/useProjectRecordsListHeader"
import {
  createProjectRecordFromEmailFn,
  discardProjectRecordEmailFn,
  draftProjectRecordFromEmailFn,
} from "@/src/server/projectRecordEmails/projectRecordEmailInbox.functions"
import { projectRecordEmailInboxItemQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailInboxQueryOptions"
import { projectRecordTemplatesByProjectQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { NewProjectRecordFormSchema } from "@/src/shared/projectRecords/schemas"

const inboxEmailRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/project-records/inbox/$projectRecordEmailId/",
)

type Draft = Awaited<ReturnType<typeof draftProjectRecordFromEmailFn>>

const TemplateChoiceSchema = z.object({
  templateChoice: z.string().min(1, { error: "Bitte wählen Sie eine Protokollvorlage." }),
})

const invalidateInboxQueries = (queryClient: QueryClient) =>
  Promise.all(
    [
      "projectRecordEmailInbox",
      "projectRecordEmailInboxItem",
      "projectRecordsTabCounts",
      "projectRecords",
      "uploads",
    ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
  )

type FormProps = {
  projectSlug: string
  projectRecordEmailId: number
  actionBarRight: ReactNode
  backLink: ReactNode
}

function InboxTemplateChoiceForm({
  projectSlug,
  projectRecordEmailId,
  actionBarRight,
  backLink,
  onDraft,
}: FormProps & { onDraft: (draft: Draft) => void }) {
  const { data: templates = [] } = useQuery(
    projectRecordTemplatesByProjectQueryOptions({ projectSlug }),
  )
  const draftMutation = useMutation({ mutationFn: draftProjectRecordFromEmailFn })
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { templateChoice: "" },
    validators: { onSubmit: TemplateChoiceSchema } as never,
    onSubmit: async ({ value }) => {
      try {
        const draft = await draftMutation.mutateAsync({
          data: {
            projectSlug,
            projectRecordEmailId,
            projectRecordTemplateId:
              value.templateChoice === "none" ? null : Number(value.templateChoice),
          },
        })
        onDraft(draft)
      } catch (error: unknown) {
        applyFormSubmitResult(form, improveErrorMessage(error, FORM_ERROR, []), setFormError)
      }
    },
  })

  const items = [
    { value: "none", label: "Ohne Vorlage" },
    ...templates.map((template) => ({
      value: String(template.id),
      label: template.templateTitle,
    })),
  ]

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText="KI-Verarbeitung starten"
      actionBarRight={actionBarRight}
      backLink={backLink}
    >
      <form.AppField name="templateChoice">
        {(field) => (
          <field.RadiobuttonGroup
            label="Protokollvorlage"
            items={items}
            help="Die KI füllt die gewählte Vorlage anhand der E-Mail aus. Das dauert etwa eine halbe Minute. Danach können Sie den Entwurf prüfen, bearbeiten und speichern."
          />
        )}
      </form.AppField>
    </FormShell>
  )
}

function InboxDraftForm({
  projectSlug,
  projectRecordEmailId,
  actionBarRight,
  backLink,
  draft,
  emailSource,
}: FormProps & { draft: Draft; emailSource: ProjectRecordEmailSourceValue }) {
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const createMutation = useMutation({ mutationFn: createProjectRecordFromEmailFn })
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleSubmit = async (values: z.infer<typeof NewProjectRecordFormSchema>) => {
    try {
      const record = await createMutation.mutateAsync({
        data: { ...values, projectSlug, projectRecordEmailId },
      })
      await invalidateInboxQueries(queryClient)
      await navigate({
        to: "/$projectSlug/project-records/$projectRecordId",
        params: { projectSlug, projectRecordId: String(record.id) },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <ProjectRecordCreateForm
      formKey={`inbox-${projectRecordEmailId}`}
      formInitialValues={{
        title: draft.title,
        body: draft.body,
        date: draft.date ?? "",
        tags: draft.tags.map(String),
        uploads: draft.uploads.map(String),
        formTemplates: draft.formTemplates.map(String),
        projectRecordTemplateId: draft.projectRecordTemplateId,
      }}
      projectSlug={projectSlug}
      createRelationContext="project"
      landAcquisitionModuleEnabled={project.landAcquisitionModuleEnabled}
      onSubmit={handleSubmit}
      emailSource={emailSource}
      submitText="Als Protokolleintrag speichern"
      actionBarRight={actionBarRight}
      backLink={backLink}
    />
  )
}

export const ProjectRecordInboxEmailContent = () => {
  const { projectSlug, projectRecordEmailId: projectRecordEmailIdParam } =
    inboxEmailRouteApi.useParams()
  const projectRecordEmailId = Number(projectRecordEmailIdParam)
  const { breadcrumb } = useProjectRecordsListHeader()
  const { data: email } = useSuspenseQuery(
    projectRecordEmailInboxItemQueryOptions({ projectSlug, projectRecordEmailId }),
  )
  const [draft, setDraft] = useState<Draft | null>(null)
  const discardMutation = useMutation({ mutationFn: discardProjectRecordEmailFn })
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const inboxPath = `/${projectSlug}/project-records/inbox`
  const isOpen = email.projectRecords.length === 0 && !email.discardedAt
  const emailSource = {
    from: email.from,
    subject: email.subject,
    date: email.date,
    textBody: email.textBody,
    uploads: email.uploads,
  }

  const handleDiscard = async () => {
    if (!window.confirm("E-Mail verwerfen? Sie erscheint dann nicht mehr im Posteingang.")) return
    await discardMutation.mutateAsync({ data: { projectSlug, projectRecordEmailId } })
    await invalidateInboxQueries(queryClient)
    await navigate({ to: "/$projectSlug/project-records/inbox", params: { projectSlug } })
  }

  const formProps = {
    projectSlug,
    projectRecordEmailId,
    backLink: <BackLink to={inboxPath} text="Zurück zum Posteingang" />,
    actionBarRight: (
      <button
        type="button"
        className={secondaryButtonClassName}
        onClick={handleDiscard}
        disabled={discardMutation.isPending}
      >
        E-Mail verwerfen
      </button>
    ),
  }

  return (
    <>
      <PageHeader breadcrumb={breadcrumb} title={email.subject || "(kein Betreff)"} />
      <div className={twJoin(pageContentPaddingClassName, "space-y-3 text-sm")}>
        {!email.isSenderKnown && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
            Die Absenderadresse gehört zu keinem Teammitglied dieses Projekts.
          </p>
        )}
        {email.skippedAttachments.length > 0 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
            Nicht übernommene Anhänge (zu groß oder Fehler beim Hochladen):{" "}
            {email.skippedAttachments.join(", ")}
          </p>
        )}
        {email.projectRecords.map((projectRecord) => (
          <p key={projectRecord.id} className="rounded-md bg-gray-50 px-3 py-2">
            Diese E-Mail ist bereits verarbeitet:{" "}
            <Link
              to="/$projectSlug/project-records/$projectRecordId"
              params={{ projectSlug, projectRecordId: String(projectRecord.id) }}
            >
              {projectRecord.title}
            </Link>
          </p>
        ))}
        {email.discardedAt && (
          <p className="rounded-md bg-gray-50 px-3 py-2">
            Diese E-Mail wurde am {new Date(email.discardedAt).toLocaleString("de-DE")} verworfen.
          </p>
        )}
      </div>
      {isOpen && draft ? (
        <InboxDraftForm {...formProps} draft={draft} emailSource={emailSource} />
      ) : (
        <div className={twJoin(pageContentPaddingClassName, "flex gap-6")}>
          <div className="flex-1">
            {isOpen ? (
              <InboxTemplateChoiceForm {...formProps} onDraft={setDraft} />
            ) : (
              <BackLink to={inboxPath} text="Zurück zum Posteingang" />
            )}
          </div>
          <ProjectRecordEmailSource email={emailSource} />
        </div>
      )}
    </>
  )
}
