import { Routes } from "@blitzjs/next"
import { addressNoreply } from "./utils/addresses"
import { mailLink } from "./utils/mailLink"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type Props = {
  userMail: string
  userId: number
  userName: string | null
  userMembershipCount: number
}

export async function userCreatedNotificationToAdmin(props: Props) {
  const text = `
Liebes Trassenscout-Team,

ein neuer Nutzer-Account wurde erstellt, bitte prüfen und einem Projekt zuordnen:

* Name: ${props.userName}
* E-Mail: ${props.userMail}
* ${
    props.userMembershipCount > 0
      ? `Es sind bereits ${props.userMembershipCount} Mitgliedschafte(n) eingetragen (Einladungsprozess)`
      : "Es sind noch keine Mitgliedschaften vorhanden"
  }

[Rechte verwalten]( ${mailLink(Routes.AdminMembershipsPage().href)} )
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: process.env.ADMIN_EMAIL }],
    Subject: "Trassenscout: User hat sich registriert",
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
