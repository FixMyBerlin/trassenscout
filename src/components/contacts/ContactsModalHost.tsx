import { useQueryClient } from "@tanstack/react-query"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import { useProjectModalSearch } from "@/src/components/shared/projectModals/useProjectModalSearch"
import { useProjectModalSlug } from "@/src/components/shared/projectModals/useProjectModalSlug"
import { contactQueryOptions } from "@/src/server/contacts/contactQueryOptions"
import type { Contact } from "@/src/server/contacts/types"

type PreviewContact = Pick<Contact, "id" | "firstName" | "lastName">

export function useContactsModal() {
  const queryClient = useQueryClient()
  const projectSlug = useProjectModalSlug()
  const modalSearch = useProjectModalSearch()
  const userCanEdit = useUserCan(projectSlug).edit
  const { buildModalHref, updateModalSearch } = useProjectModalNavigation()

  const getContactDetailHref = ({ contactId }: { contactId: number }) =>
    buildModalHref({
      modalContactId: contactId,
      modalContactView: "detail",
    })

  const getContactEditHref = ({ contactId }: { contactId: number }) =>
    buildModalHref({
      modalContactId: contactId,
      modalContactView: "edit",
    })

  const getContactNewHref = () =>
    buildModalHref({
      modalContactId: undefined,
      modalContactView: "new",
    })

  const getInviteNewHref = () =>
    buildModalHref({
      modalInviteView: "new",
    })

  const openContactDetail = (input: { contactId: number; previewContact?: PreviewContact }) => {
    if (projectSlug) {
      void queryClient.ensureQueryData(contactQueryOptions({ projectSlug, id: input.contactId }))
    }
    void updateModalSearch(
      {
        modalContactId: input.contactId,
        modalContactView: "detail",
      },
      {
        replace:
          modalSearch.modalContactId === input.contactId &&
          modalSearch.modalContactView === "detail",
        preview: input.previewContact
          ? { type: "contact", contact: input.previewContact }
          : undefined,
      },
    )
  }

  const openContactEdit = (input: { contactId: number }) => {
    if (!userCanEdit) return

    if (projectSlug) {
      void queryClient.ensureQueryData(contactQueryOptions({ projectSlug, id: input.contactId }))
    }
    void updateModalSearch(
      {
        modalContactId: input.contactId,
        modalContactView: "edit",
      },
      {
        replace:
          modalSearch.modalContactId === input.contactId && modalSearch.modalContactView === "edit",
      },
    )
  }

  const openContactNew = () => {
    if (!userCanEdit) return

    void updateModalSearch(
      {
        modalContactId: undefined,
        modalContactView: "new",
      },
      { replace: modalSearch.modalContactView === "new" },
    )
  }

  const openInviteNew = () => {
    if (!userCanEdit) return

    void updateModalSearch(
      {
        modalInviteView: "new",
      },
      { replace: modalSearch.modalInviteView === "new" },
    )
  }

  return {
    getContactDetailHref,
    getContactEditHref,
    getContactNewHref,
    getInviteNewHref,
    openContactDetail,
    openContactEdit,
    openContactNew,
    openInviteNew,
  }
}
