import { LoginForm } from "@/src/auth/components/LoginForm"
import { Notice } from "@/src/core/components/Notice"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { BlitzPage } from "@blitzjs/next"
import { useRouter } from "next/router"

export type LoginFormMessageKeys = "loginRequired"

type Props = { messageKey?: LoginFormMessageKeys }

const LoginPage: BlitzPage<Props> = ({ messageKey }) => {
  const router = useRouter()
  // const currentUser = useCurrentUser()
  // const [logoutMutation] = useMutation(logout)
  // const handleLogout = async () => {
  //   await logoutMutation()
  // }

  return (
    <LayoutMiddleBox
      title="In Account einloggen"
      subtitle="Willkommen zurück! Bitte melden Sie sich an."
    >
      <MetaTags noindex title="Anmelden" />
      {messageKey === "loginRequired" && (
        <Notice type="warn" title="Anmeldung erforderlich">
          Um die gewünschte Seite aufzurufen müssen Sie angemeldet sein.
        </Notice>
      )}
      {/* {currentUser && (
        <Notice
          type="info"
          title="Du bist bereits eingeloggt"
          actionText="Jetzt ausloggen…"
          action={handleLogout}
        >
          Du bist bereits eingeloggt. Wenn du den Account wechseln möchtest, musst du dich zuerst
          ausloggen.
        </Notice>
      )} */}
      <LoginForm
        onSuccess={(_user) => {
          const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
          return router.push(next)
        }}
      />
    </LayoutMiddleBox>
  )
}

export default LoginPage
