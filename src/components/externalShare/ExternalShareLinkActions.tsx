import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import {
  ArrowPathIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  EyeIcon,
  ShareIcon,
} from "@heroicons/react/20/solid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Fragment, useState } from "react"
import { twJoin } from "tailwind-merge"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { primaryButtonSmClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import {
  navigationMenuItemLinkStyles,
  navigationMenuTransitionProps,
} from "@/src/components/shared/app/layouts/navigation/navigationMenuItemStyles"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { rotateExternalShareTokenFn } from "@/src/server/externalShare/externalShare.functions"
import { externalShareQueryOptions } from "@/src/server/externalShare/externalShareQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { externalShareMailtoHref } from "@/src/shared/externalShare/externalShareMail"
import { externalSharePagePath } from "@/src/shared/externalShare/externalShareUrls"

const actionClassName = twJoin(linkStyles, "inline-flex items-center gap-1 text-sm")

const menuItemClassName = (focus: boolean) =>
  twJoin(navigationMenuItemLinkStyles(focus), "flex w-full cursor-pointer items-center gap-2")

type Props = {
  projectSlug: string
  token: string
}

const shareUrl = (token: string) =>
  new URL(externalSharePagePath(token), window.location.origin).toString()

export const ExternalShareLinkActions = ({ projectSlug, token }: Props) => {
  const queryClient = useQueryClient()
  const { data: user } = useQuery(currentUserQueryOptions())
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")
  const [rotated, setRotated] = useState(false)
  const rotateMutation = useMutation({ mutationFn: rotateExternalShareTokenFn })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
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
      <Menu as="div">
        {({ open }) => (
          <>
            <MenuButton className={primaryButtonSmClassName}>
              {copyState === "copied" ? (
                <CheckIcon className="size-4" aria-hidden />
              ) : (
                <ShareIcon className="size-4" aria-hidden />
              )}
              {copyState === "copied"
                ? "Link kopiert"
                : copyState === "failed"
                  ? "Kopieren nicht möglich"
                  : "Teilen"}
            </MenuButton>
            <Transition show={open} as={Fragment} {...navigationMenuTransitionProps}>
              <MenuItems
                static
                modal={false}
                anchor={{ to: "bottom end", gap: 8 }}
                className="z-20 w-56 origin-top-right rounded-md bg-white p-1.5 shadow-lg ring-1 ring-gray-200 focus:outline-hidden"
              >
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      className={menuItemClassName(focus)}
                    >
                      <DocumentDuplicateIcon className="size-4 text-gray-400" aria-hidden />
                      Link kopieren
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <a
                      href={externalShareMailtoHref({
                        shareUrl: shareUrl(token),
                        projectName: shortTitle(projectSlug),
                        senderName: getFullname(user),
                      })}
                      className={menuItemClassName(focus)}
                    >
                      <EnvelopeIcon className="size-4 text-gray-400" aria-hidden />
                      In E-Mail teilen
                    </a>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}
