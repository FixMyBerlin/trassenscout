import { BlitzPage } from "@blitzjs/next"
import { useRouter } from "next/router"
import { LoginForm } from "src/auth/components/LoginForm"
import { Layout, MetaTags } from "src/core/layouts"

const LoginPage: BlitzPage = () => {
  const router = useRouter()
  // const currentUser = useCurrentUser()
  // const [logoutMutation] = useMutation(logout)
  // const handleLogout = async () => {
  //   await logoutMutation()
  // }

  return (
    <Layout>
      <MetaTags noindex title="Anmelden" />
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
    </Layout>
  )
}

export default LoginPage
