import { quote } from "@/src/core/components/text/quote"
import { statusTranslations } from "@/src/pagesComponents/invites/TeamInvitesTable"
import {
  INVITE_DAYS_TO_DELETION,
  INVITE_DAYS_TO_EXPIRED,
} from "@/src/server/invites/inviteSettings.const"
import { InformationCircleIcon } from "@heroicons/react/24/outline"

export const TeamInviteDocumentation = () => {
  return (
    <>
      <div className="items-top prose my-10 flex gap-3">
        <InformationCircleIcon className="size-11 flex-none text-blue-500" />
        <div>
          <h2 className="mt-1.5">So funktioniert der Einladungs-Prozess</h2>
          <ul>
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
              Nach {INVITE_DAYS_TO_EXPIRED} Tagen werden die Einladungen ungültig und erhalten den
              Status {quote(statusTranslations.EXPIRED)}.
            </li>
            <li>Nach {INVITE_DAYS_TO_DELETION} Tagen werden Einladungen aus der Liste gelöscht.</li>
          </ul>
        </div>
      </div>
    </>
  )
}
