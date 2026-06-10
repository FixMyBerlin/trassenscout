import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"

export function PageAdmin() {
  return (
    <>
      <AdminPageHeader title="Dashboard" />
      <p className="text-gray-600">
        Verwaltung von Projekten, Nutzern und systemweiten Einstellungen. Wählen Sie einen Bereich
        in der Navigation links.
      </p>
    </>
  )
}
