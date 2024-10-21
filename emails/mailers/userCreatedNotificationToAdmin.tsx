import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  userMail: string
  userId: number
  userName: string | null
  userMembershipCount: number
}

export async function userCreatedNotificationToAdmin(props: Props) {
  const introMarkdown = `
Liebe Trassenscout-Admins!

# Soeben wurde ein neuer Nutzer:innen-Account erstellt.

Bitte prüfe den Account und ordne ihn einem Projekt zu.

* Name: ${props.userName}
* E-Mail: ${props.userMail}
* ${
    props.userMembershipCount > 0
      ? `Es sind bereits ${props.userMembershipCount} Mitgliedschafte(n) eingetragen (Einladungsprozess)`
      : "Es sind noch keine Mitgliedschaften vorhanden"
  }
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: process.env.ADMIN_EMAIL }],
    Subject: "[Admin] Trassenscout: Nutzer:in hat sich registriert",
    introMarkdown,
    ctaLink: mailUrl(`/admin/memberships/new?userId=${props.userId}`),
    ctaText: "Rechte vergeben",
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
