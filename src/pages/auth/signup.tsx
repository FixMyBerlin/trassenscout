import { SignupForm } from "@/src/auth/components/SignupForm"
import { Spinner } from "@/src/core/components/Spinner"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { Suspense } from "react"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <LayoutMiddleBox
      title="Account registrieren"
      subtitle="Willkommen! Hier können Sie sich registrieren."
    >
      <MetaTags noindex title="Anmelden" />

      <Suspense fallback={<Spinner />}>
        <SignupForm onSuccess={() => router.push(Routes.Home())} />
      </Suspense>
    </LayoutMiddleBox>
  )
}

export default SignupPage
