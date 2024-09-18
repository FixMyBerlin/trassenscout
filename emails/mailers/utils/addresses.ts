import { MailjetMessage } from "./types"

export const addressNoreply: MailjetMessage["From"] = {
  Email: "noreply@trassenscout.de",
  Name: "Trassenscout",
}

export const addressDevteam: MailjetMessage["From"] = {
  Email: "dev-team@fixmycity.de",
  Name: "FixMyCity Dev Team (Trassenscout)",
}
