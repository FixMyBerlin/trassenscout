import { SignupForm } from "@/src/auth/components/SignupForm"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <LayoutMiddleBox
      title="Account registrieren"
      subtitle="Willkommen! Hier können Sie sich registrieren."
    >
      <MetaTags noindex title="Anmelden" />
      <SignupForm onSuccess={() => router.push(Routes.Home())} />
    </LayoutMiddleBox>
  )
}

export default SignupPage
