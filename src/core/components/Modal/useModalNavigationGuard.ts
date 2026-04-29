"use client"

import { blockUntilModalMounts } from "@/src/core/components/Modal/modalCloseGuard"
import { useRef } from "react"

type BeginNavigationOptions = {
  holdUntilNextModalMount?: boolean
  clearDirty?: boolean
}

type Props = {
  confirmDirtyMessage?: string
}

export const useModalNavigationGuard = ({ confirmDirtyMessage }: Props = {}) => {
  const isDirtyRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const isNavigatingRef = useRef(false)

  const canClose = () => {
    if (isNavigatingRef.current) return false
    if (isSubmittingRef.current) return false
    if (isDirtyRef.current) {
      return window.confirm(confirmDirtyMessage ?? "Ungespeicherte Änderungen verwerfen?")
    }
    return true
  }

  const setDirty = (dirty: boolean) => {
    isDirtyRef.current = dirty
  }

  const setSubmitting = (submitting: boolean) => {
    isSubmittingRef.current = submitting
  }

  const beginNavigationToModal = (options?: BeginNavigationOptions) => {
    if (options?.clearDirty) {
      isDirtyRef.current = false
    }
    isNavigatingRef.current = true
    if (options?.holdUntilNextModalMount) {
      blockUntilModalMounts()
    }
  }

  const beginNavigationAfterSave = (options?: Omit<BeginNavigationOptions, "clearDirty">) => {
    beginNavigationToModal({ ...options, clearDirty: true })
  }

  return {
    canClose,
    setDirty,
    setSubmitting,
    beginNavigationToModal,
    beginNavigationAfterSave,
  }
}
