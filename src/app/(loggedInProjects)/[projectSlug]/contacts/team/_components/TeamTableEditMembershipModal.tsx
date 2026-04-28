"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Modal } from "@/src/core/components/Modal"
import { linkStyles } from "@/src/core/components/links"
import { linkIcons } from "@/src/core/components/links/Link"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import { clsx } from "clsx"
import { useState } from "react"
import { TeamTableEditMembershipModalForm } from "./TeamTableEditMembershipModalForm"

type Props = { editUser: Awaited<ReturnType<typeof getProjectUsers>>[number] }

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
