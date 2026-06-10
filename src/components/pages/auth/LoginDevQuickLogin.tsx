import { clsx } from "clsx"
import { useState } from "react"
import { DevAdminBox } from "@/src/components/core/components/AdminBox/DevAdminBox"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { DEV_LOGIN_USERS } from "./loginDevQuickLogin.const"

type Props = {
  hasInvite: boolean
  inviteToken?: string
  onQuickLogin: (email: string) => Promise<string | undefined>
}

export function LoginDevQuickLogin({ hasInvite, inviteToken, onQuickLogin }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  async function handleQuickLogin(email: string) {
    setError(null)
    setPendingEmail(email)

    try {
      const formError = await onQuickLogin(email)
      if (formError) setError(formError)
    } finally {
      setPendingEmail(null)
    }
  }

  return (
    <DevAdminBox className="text-center">
      <p className="text-sm">
        Invitation Token: {inviteToken || "NOT FOUND"}
        <br />
        Invite: {hasInvite ? "FOUND" : "NOT FOUND"}
      </p>
      <hr className="my-3 border border-white" />
      {error && (
        <p
          className="mb-3 rounded-sm bg-red-50 px-2 py-1 font-mono text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {DEV_LOGIN_USERS.map(([displayName, email]) => (
        <button
          key={displayName}
          disabled={pendingEmail !== null}
          type="button"
          onClick={() => void handleQuickLogin(email)}
        >
          {pendingEmail === email ? "…" : displayName}
        </button>
      ))}
            className={clsx(primaryButtonClassName, "px-2 py-1 text-xs")}
    </DevAdminBox>
  )
}
