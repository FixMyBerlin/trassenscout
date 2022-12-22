import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { LoginForm } from "src/auth/components/LoginForm"
import { useRouter } from "next/router"
import { MetaTags } from "src/core/layouts/MetaTags"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout>
      <MetaTags noindex title="Anmelden" />
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
