import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import { SignupForm } from "src/auth/components/SignupForm"
import { BlitzPage, Routes } from "@blitzjs/next"
import { MetaTags } from "src/core/layouts/MetaTags"

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
