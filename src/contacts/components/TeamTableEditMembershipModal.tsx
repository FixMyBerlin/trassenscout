import { clsx } from "clsx"
import { useState } from "react"
import { Modal } from "src/core/components/Modal"
import { linkStyles } from "src/core/components/links"
import { linkIcons } from "src/core/components/links/Link"
import { IfUserCanEdit } from "src/memberships/components/IfUserCan"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import { TeamTableEditMembershipModalForm } from "./TeamTableEditMembershipModalForm"

type Props = { editUser: Awaited<ReturnType<typeof getProjectUsers>>[number] }

export const TeamTableEditMembershipModal = ({ editUser }: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <IfUserCanEdit>
      <button onClick={() => setOpen(true)} className={clsx("flex items-center gap-1", linkStyles)}>
        {linkIcons["edit"]}
        Ändern
      </button>
      <Modal
        className="sm:!max-w-[600px]"
        open={open}
        handleClose={() => {
          setOpen(false)
        }}
      >
        <TeamTableEditMembershipModalForm editUser={editUser} closeModal={() => setOpen(false)} />
      </Modal>
    </IfUserCanEdit>
  )
}
