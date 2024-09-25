import { Routes } from "@blitzjs/next"
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

# Ein neuer Nutzer-Account wurde erstellt

Bitte prüfe den Account und ordne ihn einem Projekt.

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
    Subject: "[Admin] Trassenscout: User hat sich registriert",
    introMarkdown,
    ctaLink: mailUrl(Routes.AdminMembershipsPage()),
    ctaText: "Rechte verwalten",
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
