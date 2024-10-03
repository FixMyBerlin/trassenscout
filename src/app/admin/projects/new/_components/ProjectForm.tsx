"use client"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import {
  Form,
  FORM_ERROR,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { quote } from "@/src/core/components/text/quote"
import { getUserSelectOptions } from "@/src/pagesComponents/users/utils/getUserSelectOptions"
import createMembership from "@/src/server/memberships/mutations/createMembership"
import createProject from "@/src/server/projects/mutations/createProject"
import { ProjectLogoScrcsInputSchema, ProjectSchema } from "@/src/server/projects/schema"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import getUsers from "@/src/server/users/queries/getUsers"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
export { FORM_ERROR } from "@/src/core/components/forms"

export const ProjectForm = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const [createProjectMutation] = useMutation(createProject)
  const [createMembershipMutation] = useMutation(createMembership)

  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs.split("\n")
    values = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
    try {
      const project = await createProjectMutation(values)

      // Create a membership for the selected user
      if (project.managerId) {
        try {
          await createMembershipMutation({
            projectId: project.id,
            userId: project.managerId,
            role: "EDITOR",
          })
        } catch (error: any) {
          console.error(error)
          return { [FORM_ERROR]: error }
        }
      }

      router.push("/dashboard")
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <Form
      submitText="Erstellen"
      onSubmit={handleSubmit}
      schema={ProjectSchema.merge(ProjectLogoScrcsInputSchema)}
      initialValues={{ managerId: currentUser!.id }}
    >
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Empfohlenes Format: ${quote(
          "rs99",
        )}. Primäre Auszeichnung der Trasse. Wird immer in Großschreibung angezeigt aber in Kleinschreibung editiert. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField type="text" name="subTitle" label="Untertitel" optional />
      <LabeledTextField
        optional
        type="text"
        name="logoSrc"
        label="Logo"
        placeholder="beispiel.png"
      />
      <p className="!mt-1 text-sm text-gray-500">
        Das Logo wird von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p>
      <SuperAdminBox>
        <LabeledTextField
          optional
          type="text"
          name="felt_subsection_geometry_source_url"
          label="Felt Url"
          placeholder="https://felt.com/map/beispiel-karte"
          help="Die Felt-Karte muss dem Account info@fixmycity.de gehören."
        />
      </SuperAdminBox>
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledTextareaField
        optional
        name="partnerLogoSrcs"
        label="Partner-Logos (ein Logo pro Zeile)"
        placeholder="beispiel.png"
      />
      <p className="!mt-1 text-sm text-gray-500">
        Die Logos werden von FixMyCity{" "}
        <Link
          href="https://s3.console.aws.amazon.com/s3/buckets/trassenscout-public?prefix=assets/&region=eu-central-1"
          blank
        >
          extern in AWS abgelegt
        </Link>
        , von NextJS intern optimiert und hier referenziert.
      </p>
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        optional
        options={getUserSelectOptions(users)}
        help="Wir geben dieser Nutzer:in automatisch Zugriffsrechte auf dem Projekt"
      />
    </Form>
  )
}
