import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { getFullname } from "@/src/components/core/users/getFullname"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import type { ProjectUser } from "@/src/server/memberships/types"
import { TeamTableEditMembershipModalForm } from "./TeamTableEditMembershipModalForm"

type Props = { editUser: ProjectUser }

export const TeamTableEditMembershipModal = ({ editUser }: Props) => {
  const [open, setOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const handleClose = () => {
    if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return
    setOpen(false)
  }

  return (
    <IfUserCanEdit>
      <button
        onClick={() => setOpen(true)}
        className={twJoin("flex items-center gap-1", linkStyles)}
      >
        {linkIcons["edit"]}
        Rechte bearbeiten
      </button>
      <Modal className="sm:max-w-[600px]!" open={open} handleClose={handleClose}>
        <PageHeader
          title={`Rechte von ${getFullname(editUser)} bearbeiten`}
          action={<ModalCloseButton onClose={handleClose} />}
        />
        <TeamTableEditMembershipModalForm
          editUser={editUser}
          closeModal={() => {
            setIsDirty(false)
            setOpen(false)
          }}
          onDirtyChange={setIsDirty}
        />
      </Modal>
    </IfUserCanEdit>
  )
}
