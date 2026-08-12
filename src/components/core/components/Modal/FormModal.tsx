import type { ReactNode } from "react"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"

type FormModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  open?: boolean
  align?: "center" | "right"
  className?: string
}

export function FormModal({
  title,
  onClose,
  children,
  open = true,
  align = "center",
  className,
}: FormModalProps) {
  return (
    <Modal open={open} handleClose={onClose} align={align} className={className}>
      <PageHeader title={title} action={<ModalCloseButton onClose={onClose} />} />
      {children}
    </Modal>
  )
}
