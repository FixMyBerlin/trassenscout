import { InformationCircleIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { INVITE_DAYS_TO_DELETION } from "@/src/server/invites/inviteSettings.const"

export const TeamInviteDocumentation = () => {
  return (
    <div className="w-full border-b border-gray-200 bg-blue-50 text-gray-700">
      <div className={twJoin(pageContentPaddingClassName, "flex gap-3")}>
        <InformationCircleIcon className="size-5 flex-none text-blue-500" />
        <div>
          <h3 className="font-semibold">So funktioniert der Einladungs-Prozess</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Jeder mit Editor-Rechten kann Nutzer:innen einladen.</li>
            <li>
              Mit der Einladung werden die E-Mail-Adresse, die zukünftige Rolle sowie die Person,
              die einlädt, gespeichert. Alle erfahren, wer eingeladen hat.
            </li>
            <li>
              Wenn eine neue Einladung erzeugt wird, bekommen alle Mitarbeitende dieses Projekts,
              die Editor-Rechte haben, eine Hinweis-E-Mail dazu.
            </li>
            <li>
              Die eingeladene Person bekommt eine E-Mail mit einem speziellen Link. Über diesen Link
              kann sie sich registrieren oder anmelden. Dabei kann die E-Mail-Adresse nicht mehr
              geändert werden, da sie fest mit der Einladung verbunden ist.
            </li>
            <li>
              Wenn eine Einladung angenommen wurde, bekommen alle Mitarbeitende dieses Projekts, die
              Editor-Rechte haben, eine Hinweis-E-Mail dazu.
            </li>
            <li>
              Nach {INVITE_DAYS_TO_DELETION} Tagen werden Einladungen aus der Liste gelöscht. Damit
              ist der Link in der Einladungs-E-Mail nicht mehr gültig.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
