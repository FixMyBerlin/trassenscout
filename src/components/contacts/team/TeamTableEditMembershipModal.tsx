import { clsx } from "clsx"
import { useState } from "react"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Modal } from "@/src/components/core/components/Modal"
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
      <button onClick={() => setOpen(true)} className={clsx("flex items-center gap-1", linkStyles)}>
        {linkIcons["edit"]}
        Ändern
      </button>
      <Modal className="sm:max-w-[600px]!" open={open} handleClose={handleClose}>
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
