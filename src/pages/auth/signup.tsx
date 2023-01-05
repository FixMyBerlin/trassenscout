import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { SignupForm } from "src/auth/components/SignupForm"
import { LayoutMiddleBox, MetaTags } from "src/core/layouts"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <LayoutMiddleBox title="Registrieren" subtitle="Willkommen!">
      <MetaTags noindex title="Anmelden" />
      <SignupForm onSuccess={() => router.push(Routes.Home())} />
    </LayoutMiddleBox>
  )
}

export default SignupPage
