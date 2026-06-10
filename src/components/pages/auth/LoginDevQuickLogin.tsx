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
    <DevAdminBox className="my-4 gap-2 p-3 text-center text-xs">
      <p className="font-mono leading-tight">
        Token: {inviteToken || "NOT FOUND"} · Invite: {hasInvite ? "FOUND" : "NOT FOUND"}
      </p>
      {error && (
        <p className="rounded-sm bg-red-50 px-2 py-0.5 font-mono text-red-800" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-1">
        {DEV_LOGIN_USERS.map(([displayName, email]) => (
          <button
            key={displayName}
            className={clsx(primaryButtonClassName, "px-2 py-1 text-xs")}
            disabled={pendingEmail !== null}
            type="button"
            onClick={() => void handleQuickLogin(email)}
          >
            {pendingEmail === email ? "…" : displayName}
          </button>
        ))}
      </div>
    </DevAdminBox>
  )
}
