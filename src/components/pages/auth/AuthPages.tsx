import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { linkStyles, selectLinkStyle } from "@/src/components/core/components/links/styles"
import { Spinner } from "@/src/components/core/components/Spinner"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { AuthTitleBodyWrapper } from "@/src/components/pages/auth/AuthTitleBodyWrapper"
import { LoginDevQuickLogin } from "@/src/components/pages/auth/LoginDevQuickLogin"
import { DEV_LOGIN_PASSWORD } from "@/src/components/pages/auth/loginDevQuickLogin.const"
import { authClient } from "@/src/components/shared/auth/auth-client"
import { PASSWORD_RESET_REQUIRED_CODE } from "@/src/server/auth/authPasswordReset.const"
import { getPublicInviteByTokenFn } from "@/src/server/invites/publicInvite.functions"
import {
  ForgotPassword,
  forgotPasswordFormDefaultValues,
  Login,
  loginFormDefaultValues,
  ResetPassword,
  resetPasswordFormDefaultValues,
  SignupSchema,
  signupFormDefaultValues,
} from "@/src/shared/auth/schemas"
import type {
  AuthCallbackSearch,
  ForgotPasswordSearch,
  ResetPasswordSearch,
} from "@/src/shared/auth/searchSchemas"

function getSafeCallbackURL(callbackURL?: string) {
  if (!callbackURL?.startsWith("/") || callbackURL.startsWith("//")) return "/dashboard"
  return callbackURL
}

function nullableString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed || null
}

function authLinkSearch({ callbackURL, inviteToken }: Partial<AuthCallbackSearch> = {}) {
  return {
    ...(callbackURL ? { callbackURL } : {}),
    ...(inviteToken ? { inviteToken } : {}),
  }
}

function usePublicInvite(inviteToken?: string) {
  return useQuery({
    queryKey: ["publicInvite", inviteToken],
    queryFn: () => getPublicInviteByTokenFn({ data: { token: inviteToken ?? null } }),
    enabled: Boolean(inviteToken),
  })
}

function getPostAuthRedirectURL({
  callbackURL,
  projectSlug,
}: {
  callbackURL?: string
  projectSlug?: string | null
}) {
  if (projectSlug) return `/${projectSlug}`
  return getSafeCallbackURL(callbackURL)
}

async function acceptInviteAfterAuth(inviteToken: string | null | undefined) {
  if (!inviteToken) return { accepted: true as const, projectSlug: null }

  const { acceptInviteFn } = await import("@/src/server/auth/acceptInvite.functions")
  const result = await acceptInviteFn({ data: { inviteToken } })

  if (!result.accepted) {
    return {
      accepted: false as const,
      error: "Die Einladung ist ungültig oder abgelaufen.",
    }
  }

  return {
    accepted: true as const,
    projectSlug: result.projectSlug,
  }
}

function getLoginErrorMessage(error: { code?: string; message?: string }) {
  if (error.code === PASSWORD_RESET_REQUIRED_CODE) {
    return (
      error.message ||
      "Ihr Passwort muss zurückgesetzt werden. Bitte nutzen Sie „Passwort vergessen“."
    )
  }

  return error.message || "Diese Anmeldedaten sind ungültig."
}

type PublicInvite = Awaited<ReturnType<typeof getPublicInviteByTokenFn>>

function LoginForm({
  invite,
  inviteToken,
  hasInvite,
  onSubmit,
  onQuickLogin,
}: {
  invite?: PublicInvite
  inviteToken?: string
  hasInvite: boolean
  onSubmit: (values: z.infer<typeof Login>) => Promise<void | OnSubmitResult>
  onQuickLogin: (email: string) => Promise<string | undefined>
}) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      ...loginFormDefaultValues,
      email: invite?.email || "",
      inviteToken: invite?.token || null,
    },
    validators: { onSubmit: Login } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  return (
    <FormShell form={form} formError={formError} submitText="Anmelden">
      <form.AppField name="inviteToken">{(field) => <field.HiddenField />}</form.AppField>
      <form.AppField name="email">
        {(field) => (
          <field.TextField
            type="email"
            label={invite?.email ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
            placeholder="name@beispiel.de"
            autoComplete="email"
            readOnly={Boolean(invite?.email)}
          />
        )}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            label="Passwort"
            placeholder="Passwort"
            type="password"
            autoComplete="current-password"
          />
        )}
      </form.AppField>
      <div className="text-sm">
        Sie haben Ihr{" "}
        <Link to="/auth/forgot-password" className={linkStyles}>
          Passwort vergessen?
        </Link>
      </div>
      <LoginDevQuickLogin
        hasInvite={hasInvite}
        inviteToken={inviteToken}
        onQuickLogin={onQuickLogin}
      />
    </FormShell>
  )
}

function SignupForm({
  invite,
  onSubmit,
}: {
  invite?: PublicInvite
  onSubmit: (values: z.infer<typeof SignupSchema>) => Promise<void | OnSubmitResult>
}) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      ...signupFormDefaultValues,
      email: invite?.email || "",
      inviteToken: invite?.token || null,
    },
    validators: { onSubmit: SignupSchema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  return (
    <FormShell form={form} formError={formError} submitText="Registrieren">
      <form.AppField name="inviteToken">{(field) => <field.HiddenField />}</form.AppField>
      <form.AppField name="email">
        {(field) => (
          <field.TextField
            type="email"
            label={invite?.email ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
            placeholder="name@beispiel.de"
            autoComplete="email"
            readOnly={Boolean(invite?.email)}
          />
        )}
      </form.AppField>
      <form.AppField name="firstName">
        {(field) => <field.TextField label="Vorname" placeholder="" autoComplete="given-name" />}
      </form.AppField>
      <form.AppField name="lastName">
        {(field) => <field.TextField label="Nachname" placeholder="" autoComplete="family-name" />}
      </form.AppField>
      <form.AppField name="institution">
        {(field) => <field.TextField label="Organisation / Kommune" placeholder="" optional />}
      </form.AppField>
      <form.AppField name="phone">
        {(field) => (
          <field.TextField type="tel" label="Telefon" placeholder="" autoComplete="tel" optional />
        )}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            label="Passwort"
            placeholder=""
            type="password"
            autoComplete="current-password"
          />
        )}
      </form.AppField>
      <form.AppField name="privacyPolicyAccepted">
        {(field) => (
          <field.Checkbox
            label={
              <>
                Ich habe die{" "}
                <Link
                  to="/datenschutz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkStyles}
                >
                  Datenschutzerklärung
                </Link>{" "}
                gelesen und akzeptiere sie.
              </>
            }
            labelProps={{
              className:
                "block cursor-pointer pl-3 text-sm font-medium whitespace-normal text-gray-700 hover:text-gray-900",
            }}
          />
        )}
      </form.AppField>
    </FormShell>
  )
}

function ForgotPasswordForm({
  email,
  onSubmit,
}: {
  email?: string
  onSubmit: (values: z.infer<typeof ForgotPassword>) => Promise<void | OnSubmitResult>
}) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...forgotPasswordFormDefaultValues, email: email ?? "" },
    validators: { onSubmit: ForgotPassword } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  return (
    <FormShell form={form} formError={formError} submitText="E-Mail zusenden">
      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="E-Mail-Adresse"
            placeholder="name@beispiel.de"
            autoComplete="email"
          />
        )}
      </form.AppField>
    </FormShell>
  )
}

function ResetPasswordForm({
  token,
  onSubmit,
}: {
  token: string
  onSubmit: (values: z.infer<typeof ResetPassword>) => Promise<void | OnSubmitResult>
}) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...resetPasswordFormDefaultValues, token },
    validators: { onSubmit: ResetPassword } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  return (
    <FormShell form={form} formError={formError} submitText="Passwort zurücksetzen">
      <form.AppField name="token">{(field) => <field.HiddenField />}</form.AppField>
      <form.AppField name="password">
        {(field) => <field.TextField label="Neues Passwort" type="password" />}
      </form.AppField>
      <form.AppField name="passwordConfirmation">
        {(field) => <field.TextField label="Neues Passwort bestätigen" type="password" />}
      </form.AppField>
    </FormShell>
  )
}

function PageLogin({ callbackURL, inviteToken }: AuthCallbackSearch) {
  const navigate = useNavigate()
  const { data: invite } = usePublicInvite(inviteToken)
  const [passwordResetEmail, setPasswordResetEmail] = useState<string | null>(null)

  async function loginWithCredentials(values: z.infer<typeof Login>) {
    const safeCallbackURL = getSafeCallbackURL(callbackURL)
    setPasswordResetEmail(null)

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
    })

    if (error) {
      if (error.code === PASSWORD_RESET_REQUIRED_CODE) {
        setPasswordResetEmail(values.email)
      }

      return { [FORM_ERROR]: getLoginErrorMessage(error) }
    }

    try {
      const inviteResult = await acceptInviteAfterAuth(values.inviteToken)
      if (!inviteResult.accepted) {
        return { [FORM_ERROR]: inviteResult.error }
      }

      void navigate({
        to: getPostAuthRedirectURL({
          callbackURL: safeCallbackURL,
          projectSlug: inviteResult.projectSlug,
        }),
      })
    } catch {
      return {
        [FORM_ERROR]: "Die Einladung konnte nicht angenommen werden.",
      }
    }
  }

  async function handleLogin(values: z.infer<typeof Login>) {
    return loginWithCredentials(values)
  }

  async function handleQuickLogin(email: string) {
    const result = await loginWithCredentials({
      email,
      password: DEV_LOGIN_PASSWORD,
      inviteToken: invite?.token ?? null,
    })

    return result?.[FORM_ERROR]
  }

  return (
    <AuthTitleBodyWrapper
      title="In Account einloggen"
      subtitle="Willkommen zurück! Bitte melden Sie sich an."
    >
      <LoginForm
        key={invite?.email ?? "login"}
        invite={invite}
        inviteToken={inviteToken}
        hasInvite={Boolean(invite)}
        onSubmit={handleLogin}
        onQuickLogin={handleQuickLogin}
      />

      {passwordResetEmail && (
        <div className="mt-4 text-sm">
          <Link
            to="/auth/forgot-password"
            search={{ email: passwordResetEmail }}
            className={selectLinkStyle(true)}
          >
            Passwort zurücksetzen
          </Link>
        </div>
      )}

      <div className="mt-4 text-sm">
        Sie haben noch keinen Account? Zur{" "}
        <Link
          to="/auth/signup"
          search={authLinkSearch({ callbackURL, inviteToken })}
          className={linkStyles}
        >
          Registrierung
        </Link>
        .
      </div>
    </AuthTitleBodyWrapper>
  )
}

export function PageLoginRoute() {
  const search = useSearch({ from: "/auth/login" })
  return <PageLogin callbackURL={search.callbackURL} inviteToken={search.inviteToken} />
}

function PageSignup({ callbackURL, inviteToken }: AuthCallbackSearch) {
  const navigate = useNavigate()
  const { data: invite } = usePublicInvite(inviteToken)

  async function handleSignup(values: z.infer<typeof SignupSchema>) {
    const firstName = values.firstName.trim()
    const lastName = values.lastName.trim()
    const safeCallbackURL = getSafeCallbackURL(callbackURL)
    const { error } = await authClient.signUp.email({
      email: values.email,
      firstName,
      institution: nullableString(values.institution) ?? undefined,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      password: values.password,
      phone: nullableString(values.phone) ?? undefined,
    })

    if (error) {
      return { [FORM_ERROR]: error.message || "Die Registrierung ist fehlgeschlagen." }
    }

    try {
      const inviteResult = await acceptInviteAfterAuth(values.inviteToken)
      if (!inviteResult.accepted) {
        return { [FORM_ERROR]: inviteResult.error }
      }

      void navigate({
        to: getPostAuthRedirectURL({
          callbackURL: safeCallbackURL,
          projectSlug: inviteResult.projectSlug,
        }),
      })
    } catch {
      return {
        [FORM_ERROR]: "Die Einladung konnte nicht angenommen werden.",
      }
    }
  }

  return (
    <AuthTitleBodyWrapper
      title="Account registrieren"
      subtitle="Willkommen! Hier können Sie sich registrieren."
    >
      <SignupForm key={invite?.email ?? "signup"} invite={invite} onSubmit={handleSignup} />

      <div className="mt-4 text-sm">
        Sie haben bereits einen Account? Zur{" "}
        <Link
          to="/auth/login"
          search={authLinkSearch({ callbackURL, inviteToken })}
          className={linkStyles}
        >
          Anmeldung
        </Link>
        .
      </div>
    </AuthTitleBodyWrapper>
  )
}

export function PageSignupRoute() {
  const search = useSearch({ from: "/auth/signup" })
  return <PageSignup callbackURL={search.callbackURL} inviteToken={search.inviteToken} />
}

function PageForgotPassword({ email }: ForgotPasswordSearch) {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleForgotPassword(values: z.infer<typeof ForgotPassword>) {
    const resetPasswordPath = router.buildLocation({ to: "/auth/reset-password" }).href
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}${resetPasswordPath}`,
    })

    if (error) {
      return { [FORM_ERROR]: error.message || "Die E-Mail konnte nicht gesendet werden." }
    }

    setIsSuccess(true)
  }

  return (
    <AuthTitleBodyWrapper
      title="Passwort vergessen"
      subtitle="Bitte geben Sie Ihre E-Mail-Adresse ein, damit wir Ihnen einen Link zum Zurücksetzen Ihres Passwort senden können."
    >
      {isSuccess ? (
        <div className="prose">
          <p>Wenn Ihre E-Mail-Adresse im System ist, sollten Sie eine E-Mail bekommen haben.</p>
          <p>Klicken Sie darin auf den Link {frenchQuote("Ein neues Passwort vergeben")}.</p>
        </div>
      ) : (
        <ForgotPasswordForm
          key={email ?? "forgot-password"}
          email={email}
          onSubmit={handleForgotPassword}
        />
      )}
    </AuthTitleBodyWrapper>
  )
}

function PageResetPassword({ error, token }: ResetPasswordSearch) {
  const [isSuccess, setIsSuccess] = useState(false)

  if (error || !token) {
    return (
      <AuthTitleBodyWrapper title="Neues Passwort vergeben">
        <h2>Dieser Link ist ungültig.</h2>
      </AuthTitleBodyWrapper>
    )
  }

  async function handleResetPassword(values: z.infer<typeof ResetPassword>) {
    const { error: resetError } = await authClient.resetPassword({
      newPassword: values.password,
      token: values.token,
    })

    if (resetError) {
      return {
        [FORM_ERROR]: resetError.message || "Das Passwort konnte nicht geändert werden.",
      }
    }

    setIsSuccess(true)
  }

  return (
    <AuthTitleBodyWrapper title="Neues Passwort vergeben">
      {isSuccess ? (
        <>
          <h2>Passwort erfolgreich zurückgesetzt.</h2>
          <p className="mt-5">
            <Link to="/dashboard" className={selectLinkStyle(true)}>
              Zur Startseite
            </Link>
          </p>
        </>
      ) : (
        <ResetPasswordForm token={token} onSubmit={handleResetPassword} />
      )}
    </AuthTitleBodyWrapper>
  )
}

export function PageForgotPasswordRoute() {
  const search = useSearch({ from: "/auth/forgot-password" })
  return <PageForgotPassword email={search.email} />
}

export function PageResetPasswordRoute() {
  const search = useSearch({ from: "/auth/reset-password" })
  return <PageResetPassword error={search.error} token={search.token} />
}

export function PageLogout() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(
    function signOutOnLogoutPageMount() {
      let isCurrent = true

      async function signOut() {
        const { error } = await authClient.signOut()
        if (!isCurrent) return

        if (error) {
          setMessage(error.message || "Die Abmeldung ist fehlgeschlagen.")
        } else {
          void navigate({ to: "/auth/login" })
        }
      }

      void signOut()

      return function ignoreFinishedSignOut() {
        isCurrent = false
      }
    },
    [navigate],
  )

  return (
    <AuthTitleBodyWrapper title="Abmelden" subtitle="Sie werden abgemeldet…">
      {message && <p className="text-sm text-red-700">{message}</p>}
      <Spinner page />
    </AuthTitleBodyWrapper>
  )
}
