import { twJoin } from "tailwind-merge"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"

export function PageAdmin() {
  return (
    <>
      <AdminPageHeader title="Dashboard" />
      <p className={twJoin(pageContentPaddingClassName, "text-gray-600")}>
        Verwaltung von Projekten, Nutzern und systemweiten Einstellungen. Wählen Sie einen Bereich
        in der Navigation links.
      </p>
    </>
  )
}
