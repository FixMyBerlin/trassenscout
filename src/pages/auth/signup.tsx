import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { SignupForm } from "src/auth/components/SignupForm"
import { Layout, MetaTags } from "src/core/layouts"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout>
      <MetaTags noindex title="Anmelden" />
      <SignupForm onSuccess={() => router.push(Routes.Home())} />
    </Layout>
  )
}

export default SignupPage
