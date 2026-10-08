import { ArrowPathIcon, DocumentDuplicateIcon, EyeIcon } from "@heroicons/react/20/solid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { rotateExternalShareTokenFn } from "@/src/server/externalShare/externalShare.functions"
import { externalShareQueryOptions } from "@/src/server/externalShare/externalShareQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { externalSharePagePath } from "@/src/shared/externalShare/externalShareUrls"

const actionClassName = twJoin(linkStyles, "inline-flex items-center gap-1 text-sm")

type Props = {
  projectSlug: string
  token: string
}

export const ExternalShareLinkActions = ({ projectSlug, token }: Props) => {
  const queryClient = useQueryClient()
  const { data: user } = useQuery(currentUserQueryOptions())
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")
  const [rotated, setRotated] = useState(false)
  const rotateMutation = useMutation({ mutationFn: rotateExternalShareTokenFn })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(externalSharePagePath(token), window.location.origin).toString(),
      )
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    }
    setTimeout(() => setCopyState("idle"), 2000)
  }

  const rotateLink = async () => {
    const confirmed = window.confirm(
      "Geheimlink erneuern? Der bisherige Link funktioniert danach nicht mehr – alle externen Personen benötigen den neuen Link.",
    )
    if (!confirmed) return
    try {
      await rotateMutation.mutateAsync({ data: { projectSlug } })
    } catch {
      window.alert(
        "Der Geheimlink konnte nicht erneuert werden. Der bisherige Link ist weiterhin gültig.",
      )
      return
    }
    await queryClient.invalidateQueries({
      queryKey: externalShareQueryOptions({ projectSlug }).queryKey,
    })
    setRotated(true)
    setTimeout(() => setRotated(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {isAdmin(user ?? null) && (
        <span className="inline-flex items-center gap-2">
          <AdminBadge variant="purple">Admin</AdminBadge>
          <button
            type="button"
            onClick={() => void rotateLink()}
            disabled={rotateMutation.isPending}
            className={actionClassName}
          >
            <ArrowPathIcon className="size-4" aria-hidden />
            {rotated ? "Erneuert" : "Geheimlink erneuern"}
          </button>
        </span>
      )}
      <a
        href={externalSharePagePath(token)}
        target="_blank"
        rel="noopener noreferrer"
        className={actionClassName}
      >
        <EyeIcon className="size-4" aria-hidden />
        Vorschau
      </a>
      <button type="button" onClick={() => void copyLink()} className={actionClassName}>
        <DocumentDuplicateIcon className="size-4" aria-hidden />
        {copyState === "copied"
          ? "Kopiert"
          : copyState === "failed"
            ? "Kopieren nicht möglich"
            : "Geheimlink kopieren"}
      </button>
    </div>
  )
}
