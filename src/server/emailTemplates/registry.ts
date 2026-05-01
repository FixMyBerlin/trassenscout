export const emailTemplateKeys = {
  forgotPassword: "forgot_password",
  invitationCreatedUser: "invitation_created_user",
  invitationCreatedEditorsNotification: "invitation_created_editors_notification",
  membershipCreatedEditorsNotification: "membership_created_editors_notification",
  projectRecordEmailWithoutProjectAdmin: "project_record_email_without_project_admin",
  projectRecordNeedsReviewAdmin: "project_record_needs_review_admin",
  userCreatedAdminNotification: "user_created_admin_notification",
  userCreatedUserNotification: "user_created_user_notification",
} as const

export type EmailTemplateKey = (typeof emailTemplateKeys)[keyof typeof emailTemplateKeys]

export type EmailTemplateDefinition = {
  key: EmailTemplateKey
  name: string
  description: string
  allowedVariables: string[]
  defaults: {
    subject: string
    introMarkdown: string
    outroMarkdown?: string
    ctaText?: string
  }
}

// Survey emails are intentionally excluded for now because they are already
// configured via survey-specific config and are out of scope for the first MVP.
export const emailTemplateRegistry: Record<EmailTemplateKey, EmailTemplateDefinition> = {
  [emailTemplateKeys.forgotPassword]: {
    key: emailTemplateKeys.forgotPassword,
    name: "Passwort zurücksetzen",
    description: "E-Mail an Nutzer:innen nach Anforderung eines Passwort-Reset-Links.",
    allowedVariables: [],
    defaults: {
      subject: "Trassenscout: Setzen Sie ihr Passwort zurück",
      introMarkdown: "# Setzen Sie ihr Passwort zurück.",
      ctaText: "Ein neues Passwort vergeben",
    },
  },
  [emailTemplateKeys.invitationCreatedUser]: {
    key: emailTemplateKeys.invitationCreatedUser,
    name: "Einladung an Mitwirkende",
    description: "E-Mail an eingeladene Personen zur Mitarbeit in einem Projekt.",
    allowedVariables: ["inviterName", "projectName", "loginUrl"],
    defaults: {
      subject: "Trassenscout: Ihre Einladung zum Projekt {{projectName}}",
      introMarkdown: `Guten Tag!

# {{inviterName}} hat Sie soeben eingeladen, am Projekt {{projectName}} mitzuwirken.

Bitte registieren Sie sich, um die Einladung anzunehmen.`,
      outroMarkdown: `Falls Sie schon einen Trassenscout-Account unter dieser E-Mail-Adresse besitzen, [melden Sie sich bitte damit an]({{loginUrl}}), um die Einladung anzunehmen.`,
      ctaText: "Einladung annehmen und registrieren",
    },
  },
  [emailTemplateKeys.invitationCreatedEditorsNotification]: {
    key: emailTemplateKeys.invitationCreatedEditorsNotification,
    name: "Info an Editoren: Einladung erstellt",
    description: "Benachrichtigung an Editor-Mitglieder, dass eine Einladung erstellt wurde.",
    allowedVariables: ["projectName", "inviterName", "invitesUrl"],
    defaults: {
      subject: "Trassenscout: Neues Teammitglied eingeladen",
      introMarkdown: `Guten Tag!

Diese Mail dient zur Information aller Personen mit der Rolle "Editor" im Projekt {{projectName}}.

# {{inviterName}} hat soeben eine:n neue:n Mitwirkende:n eingeladen.

Die Liste aller offenen Einladungen finden Sie unter {{invitesUrl}}.`,
    },
  },
  [emailTemplateKeys.membershipCreatedEditorsNotification]: {
    key: emailTemplateKeys.membershipCreatedEditorsNotification,
    name: "Info an Editoren: Einladung angenommen",
    description:
      "Benachrichtigung an Editor-Mitglieder, dass eine Einladung angenommen wurde.",
    allowedVariables: ["projectName", "inviteeName", "roleName", "teamUrl"],
    defaults: {
      subject: "Trassenscout: Neues Teammitglied ({{projectName}})",
      introMarkdown: `Guten Tag!

Diese E-Mail dient zur Information aller Personen mit der Rolle "Editor" im Projekt {{projectName}}.

# {{inviteeName}} hat soeben die Einladung zur Mitarbeit angenommen und hat jetzt {{roleName}}.

Das Projektteam kann unter {{teamUrl}} eingesehen werden.`,
    },
  },
  [emailTemplateKeys.projectRecordEmailWithoutProjectAdmin]: {
    key: emailTemplateKeys.projectRecordEmailWithoutProjectAdmin,
    name: "Admin: E-Mail keinem Projekt zugeordnet",
    description:
      "Benachrichtigung an Admins, wenn eine eingehende Projekt-Record-E-Mail keinem Projekt zugeordnet werden konnte.",
    allowedVariables: [
      "subjectSuffix",
      "reasonText",
      "senderEmail",
      "emailSubject",
      "usedSubaddressLine",
    ],
    defaults: {
      subject: "[Admin] Trassenscout: {{subjectSuffix}}",
      introMarkdown: `Hallo Trassenscout-Admin!

# Eine Email konnte keinem Projekt zugeordnet werden

{{reasonText}}

**Absenderadresse:** {{senderEmail}}
**Betreff:** {{emailSubject}}
{{usedSubaddressLine}}`,
      ctaText: "Email im Admin Interface anzeigen",
    },
  },
  [emailTemplateKeys.projectRecordNeedsReviewAdmin]: {
    key: emailTemplateKeys.projectRecordNeedsReviewAdmin,
    name: "Admin: E-Mail braucht Prüfung",
    description:
      "Benachrichtigung an Admins, wenn eine eingehende Projekt-Record-E-Mail manuell geprüft werden muss.",
    allowedVariables: [
      "projectSlug",
      "subjectSuffix",
      "reviewReason",
      "senderEmail",
      "emailSubject",
      "actionItemsMarkdown",
    ],
    defaults: {
      subject: "[Admin] Trassenscout: {{subjectSuffix}} in Projekt {{projectSlug}}",
      introMarkdown: `Hallo Trassenscout-Admin!

# Eine Email benötigt Admin-Prüfung im Projekt {{projectSlug}}

Die Email wurde automatisch als Protokolleintrag erfasst, benötigt jedoch eine Admin-Prüfung, da {{reviewReason}}.

**Absenderadresse:** {{senderEmail}}
**Betreff:** {{emailSubject}}

Bitte prüfen Sie den erstellten Protokolleintrag und entscheiden Sie, ob:
{{actionItemsMarkdown}}`,
      ctaText: "Protokolleintrag prüfen",
    },
  },
  [emailTemplateKeys.userCreatedAdminNotification]: {
    key: emailTemplateKeys.userCreatedAdminNotification,
    name: "Admin: Nutzerkonto erstellt",
    description: "Benachrichtigung an Admins, wenn sich eine neue Person registriert hat.",
    allowedVariables: ["userName", "userMail", "membershipStatusText"],
    defaults: {
      subject: "[Admin] Trassenscout: Nutzer:in hat sich registriert",
      introMarkdown: `Liebe Trassenscout-Admins!

# Soeben wurde ein neuer Nutzer:innen-Account erstellt.

Bitte prüfe den Account und ordne ihn einem Projekt zu.

* Name: {{userName}}
* E-Mail: {{userMail}}
* {{membershipStatusText}}`,
      ctaText: "Rechte vergeben",
    },
  },
  [emailTemplateKeys.userCreatedUserNotification]: {
    key: emailTemplateKeys.userCreatedUserNotification,
    name: "Info an Nutzer:in: Account erstellt",
    description: "Begrüßungs- und Informationsmail nach erfolgreicher Registrierung.",
    allowedVariables: ["userName"],
    defaults: {
      subject: "Trassenscout: Account erstellt",
      introMarkdown: `Guten Tag {{userName}}!

Herzlich Willkommen im Trassenscout! Diese E-Mail dient zur Information, dass Sie soeben erfolgreich einen Account erstellt haben.`,
      ctaText: "Trassenscout öffnen",
    },
  },
}

export const emailTemplateDefinitions = Object.values(emailTemplateRegistry)

export const getEmailTemplateDefinition = (key: EmailTemplateKey) => emailTemplateRegistry[key]
